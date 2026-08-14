# MMD 物理方案说明（交接文档）

> 给接手本项目的开发者/LLM 的快速说明。先看这份再动代码，能省掉大部分踩坑时间。
> 所有数值均为真机/无头环境下实测标定，改前想清楚理由。

## 1. 一句话总览

**three@0.160 官方 `MMDPhysics.js`（Ammo.js / Bullet wasm 后端）+ 大量运行时参数调校**。
没有自研物理内核；所有"手感"来自对 Bullet 刚体/约束参数的二次调校（重力、风力、约束松绑）。

## 2. 架构与加载链路

```
<script src="...three@0.160.0/examples/jsm/libs/ammo.wasm.js">   ← 经典脚本，暴露全局 Ammo() 工厂
    → Ammo().then(lib => { Ammo = lib })                          ← 异步就绪（模型加载可并行，ammoReady Promise 排队）

import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js' ← CDN，与 three 0.160 同版本
import { MMDLoader } from './vendor/MMDLoader.js'                 ← 本地版（透传骨骼 flag，勿换回官方版）

mesh.geometry.userData.MMD = { bones, iks, grants, rigidBodies, constraints }
    → new MMDPhysics(mesh, mmd.rigidBodies, mmd.constraints, { unitStep, maxStepNum, gravity })
    → physics.warmup(60)   ← 必须：让裙摆/头发落定，否则开场瞬间炸开
```

**每帧流程（animate 内，顺序不能乱）**：

```
待机摇摆 applySway(t) → 微风施力 applyWind(t) → mesh.updateMatrixWorld(true) → physics.update(dt)
```

- `dt` 必须限幅 `Math.min(delta, 1/30)`：后台切回/掉帧时大步长会让 Bullet 爆炸。
- `updateMatrixWorld(true)` 必须在 `physics.update` 前：MMDPhysics 读 `bone.matrixWorld` 驱动 kinematic 刚体。
- 单位制：MMD 1 单位 = 10cm，重力 `(0, -98, 0)`（官方默认，勿改）。

## 3. 参数调校系统（本项目的核心价值）

所有参数在 PHYS 面板可调，`physCfg` 单对象 + `localStorage` 持久化（`savePhysCfg()` 15 个调用点）+ "恢复默认"（`PHYS_DEFAULTS`）。

| 参数 | 默认 | 作用 |
|---|---|---|
| enabled | true | 物理总开关 |
| sway / amp / speed | false / 0.06 / 1.0 | 待机摇摆：根骨骼（センター）正弦摆动 |
| windOn / wind / windAuto / windAngle | false / 0.12 / true / 0 | 微风：方向扫动或手动罗盘指定 |
| gravity | 1.0 | 全局重力倍率 |
| softGrav | **0.15** | 头发/领带刚体单独重力倍率 |
| autoRotate | true | 相机自动环绕 |
| debug | false | 刚体线框（MMDPhysicsHelper） |

### 三个核心调校（缺一不可，改前先读坑）

**① 配件微重力 `softGrav=0.15` + `SKIRT_GRAV=0.3`**
`applyPhysTuning()` 里对刚体逐个 `body.setGravity(...)`（只改重力，不动质量）。
原因：Sour 式初音头发刚体 mass=8.68（裙子才 0.1~1.0），Bullet 下重力矩远超 PMX 弹簧刚度，
静止时卷曲双马尾被拉直（实测末端偏移 4 单位），观感"头发被拉得特别长"。
**头发/领带 15% 重力、裙子 30% 重力，其余 100%。**

**② 裙摆/袖口约束松绑 `loosenSoftParts()`**
Sour 裙子约束被作者焊死：旋转限制 ±0.02 rad（1.1°）+ 位置弹簧 100 = 物理钢板。
运行时对约束对象重设（基于原始 params 计算，**幂等**，可反复调用）：
- 裙子：旋转限制 ×4、旋转弹簧 ×0.25、位置弹簧 ×0.1
- 袖子：旋转限制 ×3、旋转弹簧 ×0.5、位置弹簧 ×0.5

**③ 风只吹头发/领带（防走光设计）**
`applyWind()` 的正则 `!/髮|髪|ネクタイ/`——裙子/袖子**完全不受风推力**，
它们只靠约束松绑后的惯性摆动。这是用户的明确要求（裙摆被风吹起会走光），不要改回去。

## 4. 踩过的坑（重要，别重蹈覆辙）

1. **不要直接调约束 spring 刚度**：实测非线性——头发弹簧 ×2 反而更糟、×0.5 直接 NaN。要调"手感"走重力/风力路线。
2. **`setDamping` 也救不了**：给 spring 加阻尼实测甩动更大。弹簧相关参数维持模型原始值。
3. **"拉长"不是位移拉长**：MMD 约束线性限制全是 0（链长恒定），"头发被拉长"= 每节旋转累积把卷发甩直（伸直比 0.906→0.942）。诊断方向别搞错。
4. **three 分发的 ammo.wasm.js 是精简构建**：没有 `getCollisionObjectArray()`。释放资源必须遍历 `physics.bodies` / `physics.constraints` 逐个 `Ammo.destroy`（现有 `disposePhysics()` 已实现）。
5. **Ammo 是异步加载的**：模块顶层禁止 `new Ammo.btVector3(...)`（会炸）。施力用的矢量必须惰性创建（`_windV` 模式）。
6. **mmd-parser 有已知 bug**：PMX morph 类型 4~7（附加UV）和 9（impulse）不消费字节。
   本项目 4 个模型没有这些类型所以没问题，**新增模型时务必验证**（`userData.MMD.rigidBodies.length` 是否合理）。
7. **dt 限幅 1/30**（见第 2 节），掉帧后回来不炸就靠它。
8. **待机摇摆只摇无动态刚体绑定的骨骼**：根骨骼（センター）永远安全；摇有 type1/2 刚体的骨骼会被物理回写覆盖/打架。
9. **眨眼功能已回滚**：scale 压缩目骨骼的做法观感极差（用户原话"太可怕了"）。别再实现，呼吸同理慎做。
10. **时序坑**：localStorage 恢复逻辑若在 `controls`（OrbitControls）定义前执行会 TDZ 报错——自动旋转状态必须在 controls 创建后应用。
11. **localStorage 自愈**：恢复时剔除 `physCfg` 不存在的字段，防止旧版本数据污染。
12. 测试脚本在 `/tmp/probe/nodetest/`（不随项目走）：`final2.mjs` 里有**过期断言**（还在检查已删除的"Teto 头发固定"），重建测试时忽略那条。

## 5. 必须保留的设计（强烈建议）

- **`unitStep: 1/65, maxStepNum: 3`**：官方注释明确"1/60 容易抖"，别改小步长。
- **`warmup(60)`** 创建后立即执行。
- **配件微重力 / 约束松绑 / 风豁免三件套**（第 3 节）——这是"手感"的全部来源。
- **模型切换完整释放**：`disposePhysics()`（Ammo 对象全销毁）+ `disposeModel()`（GPU 资源），防内存累积。
- **`getWindAngle(t)` 单一来源**：面板罗盘、3D 风向箭头、物理施力共用，方向永不错位。
- **`syncPhysUI()` 单一 UI 同步入口**：恢复默认/持久化恢复都走它。
- **风向罗盘 + 3D 箭头**：0°=朝 +Z（观众），顺时针；罗盘上=前/右=右。
- **面板 meta 行**：刚体/约束数 + 物理耗时 EMA（`physMs`，500ms 刷新）。

## 6. 新增模型注意

- 物理零配置：PMX 自带刚体/约束即自动生效；无刚体模型自动跳过并提示。
- 验证要点：morph 类型（见坑 6）、刚体/约束数量合理性。
- 若新模型头发/裙子观感异常，先看：刚体质量是否过大（→ 微重力）、裙子约束是否焊死（→ 松绑系数）。
