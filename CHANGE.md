# 📜 CHANGE · 变更记录

> 项目演进完整档案。姊妹文档：
> [`PHYSICS.md`](PHYSICS.md)（物理方案与参数）· [`DEVLOG.md`](DEVLOG.md)（开发者交流）· [`ISSUES.md`](ISSUES.md)（问题清单）

---

## 📦 2026-08-13 · 架构与加载

### 单文件 → 拆分

- 模型/纹理移出 HTML：`9.2MB → 24KB`（`White.pmx` + `tex/ toon/ spa/` 共 10 张贴图）

### 模型加载演进（三次迭代）

| 阶段 | 方案 | 结果 |
|------|------|------|
| ① | 本地选择/拖入替换（`loadLocalFile`） | 死代码修复，但流程重 |
| ② | 模型选择面板（`manifest.json` + `fetch → loader.parse`） | 自定义链路不可靠，回退 |
| ③ | **`MMDLoader.load` 官方路径**（T-1 重新接入） | ✅ 保留至今 |

- 最终形态：PHYS 头部 `MODELS` 按钮 → 右上模型列表面板（Material 卡片、当前项高亮）
- `initModels` 读 `manifest.json` → 默认加载 White；失败 fallback 白模
- 切换模型复用 `disposeModel` / 物理清理

### 模型清单（4 个）

| 模型 | 说明 |
|------|------|
| Kasane Teto SynthV（SV / SV_TEX） | 26 项纹理路径核对一致；Tex 文件名按 PMX 引用改首字母大写 |
| Sour 式初音ミク（White / Black） | 源包 `Sour式初音ミクVer.1.02.zip`；正名替换原"调试示例" |
| ~~冰饭式初音未来~~ | **已移除**（额头毛发坠地遗留 + readme 禁止二次配布） |

- 去重：删除根目录 `White.pmx/tex/toon/spa`（与 `models/Sour式初音ミク/` 完全重复，约 6.8MB）

---

## 🎨 2026-08-13 · UI / 视觉

### 终端风 → Material Design

- 移除 `#terminal` 窗口 / titlebar 红黄绿点 / boot 假日志 / 终端光标
- 新结构：`AppBar` + 全屏 `stage` + HUD 信息卡 + PHYS 卡片 + 左下日志卡
- 日志真实化（P2-5）：`appendLine` 用 Material 图标 + 去 `[OK]` 前缀，最多 4 条
- 字体：新增 **Noto Sans SC** CDN 依赖

### 主题演进

| 项 | 变化 |
|----|------|
| 配色 | mint 绿 → 浅蓝 `#64b5f6` → 白底下 `#42a5f5` |
| 主题 | 深色 → **浅色**（`--bg #eef2f7`、卡片白、深色文字、浅阴影） |
| 3D 场景 | 同步浅色化（`scene.background #e3eaf2`、grid/装饰环浅蓝灰） |

### 滑块三版迭代

1. 原生 `range` → `md-slider`（@material/web）→ 2. **原生 range + 自定义 Material 2 风格**（保留至今）
   - 移除 @material/web 依赖；`updateSliderFill()` 计算 active 占比（WebKit 渐变 / Firefox range-progress）

### 布局与交互细节

- HUD 详情卡可折叠（默认收起）；PHYS 头部规格对齐 HUD（`padding 8px 14px`）
- **卡片动态层级**：后点击/展开者 `z-index 30`，另一张回落 20（`raiseCardTop`）；日志卡固定 `15` 底层；MODELS 面板固定 `40`
- 复位视角按钮：`restart_alt` 图标，右下角，白底方形（最后定型 **36×36**，对齐卡片头部高度）
- 移除底部操作提示（#tip）；视角适配 x 偏移归零（正面朝用户）
- **详细日志弹窗**（08-14）：日志卡头 `⤢` → 大弹窗（完整日志/等宽字体/状态着色/实时追加/复制按钮/✕·遮罩·Esc 关闭）

---

## ⚙️ 2026-08-13 · 物理调校

### 渲染与加载修复

- 角色偏暗：贴图 `colorSpace = SRGBColorSpace` + 光照增强（Ambient 1.0 / key 1.8 / fill 0.8 / rim 0.7）
- P1-3 CDN 静默崩溃：Ammo try/catch + 全局 error 可见错误条
- P1-4 `_gVec` 单例复用（不再每次 `new btVector3`）
- P3-6 FPS 计时起点 = 第一帧；P3-2 resize rAF 防抖 + pixelRatio 同步
- P3-4 相机边界包含当前距离（加载后不变焦突变）

### 抖动治理时间线

| 阶段 | 手段 |
|------|------|
| 待机摇摆 | 幅度减半/频率降低 + `setDamping(0.15, 0.25)` |
| 收敛 | 阻尼加大 `0.3/0.5` + 摇摆幅度再降（0.015/0.012/0.018）+ `maxStepNum 3→5` |
| 顺序 | **P3-3**：摇摆移到 `physics.update` 之后（不被 `_updateBones` 回写覆盖） |

### 默认参数（用户调校）

| 参数 | 默认 | 说明 |
|------|------|------|
| 重力 | `-98 → -30` | 缓解裙摆抖动 |
| 裙摆弹簧上限 | `40 → 200` | 同上 |
| 离心力 | `40 → 0` | 默认关闭，面板可开 |
| 自动旋转 | 默认开启 | 移入 PHYS 面板 |

### 约束与识别修复

- P2-1：裙摆识别兼容日文全/半角 + 英文（`スカート` / `skirt` / `ｽｶｰﾄ`）
- P2-2：约束修正失败不再静默（console.warn + 页面提示一次）
- `setLimit is not a function`：方法存在性检查，非 6DofSpring 约束跳过

### 装饰环（P3-1）

- 曾抬到头顶 → **回退原位**（原设计：横穿身体是刻意保留）

---

## 🧩 2026-08-13 · 部署与开源

- `server.py` 四版迭代（菜单/常驻/前台）→ **最终移除**，README 改回 `python3 -m http.server`
- 开源准备：删除 LICENSE 后按各模型 readme 核对许可 → 重新加入 AGPL LICENSE（用户自管）
- 冰饭式移除（目录 + manifest + 引用，仅留 CHANGE 历史）

---

## 🔬 2026-08-14 · 物理 v2.5 重写（手搓版）→ 回滚

**背景**：旧物理补丁摞补丁（阻尼/限位倍率/弹簧），用户决定重写。

### v2.5 尝试（自研 `PhysicsManager` 替代 MMDPhysics）

- type0 刚体不回写骨骼（消除"回写覆盖动画"）
- 固定步长 `1/120` 累加（帧率无关）
- 约束统一：仅 6DofSpring 修正 + 平衡点 + 弹簧下限
- 面板参数统一入口 `applyParams()`；自研 `dispose()`

**结果**：多轮修复（frame 算法/`setLimit` 缺失/刚体初始位置/弹簧阻尼）后**仍持续抽搐** → 按用户决定**整体回滚**到旧系统。

> 📊 **手搓成本记录**：该自研版**物理完全不生效**——模型加载/显示正常，但无论怎么调参，裙摆/头发都和未装物理时完全一样（零物理反应），最终整体回滚。从设计到回滚共耗时 **5,217.3 秒（约 1.45 小时）**——产出物仅剩经验笔记（下方"沉淀经验"），代码全部废弃。教训：MMD 物理的刚体/约束映射细节极多，自研成本远高于预期，且"跑得起来 ≠ 物理生效"。

### 沉淀经验（v2.5 笔记，供后人）

> 内部开发文档已归档（不随发布版），要点摘录如下：

- three 定制 ammo.wasm.js 为**混淆版**（类名 `lC`；无 `setLimit`/`copy`/`multiply`）
- 约束 frame 正确算法：`frameA = invA·form`、`frameB = invB·form`
- 刚体初始变换必须 `getWorldPosition()`；弹簧需 `setDamping`；物理创建后 `warmup()`

### 参考调研（babylon-mmd，248★）

- ① STOP_ERP `0.1 → 0.475`（MMD 原版/Bullet 2.75）
- ② 骨骼阶段更新：vendor 本地化 MMDLoader（4 文件），透传 PMX 骨骼 flag（`0x1000` TransformAfterPhysics）

---

## 🏆 2026-08-14 · 物理 v3（采纳新 AI 科研方案）

**背景**：新 AI 基于"无物理版"从零研究，产出 `PHYSICS.md` 完整方案，用户认可。

### 方案核心（非自研，符合"禁止重复造轮子"）

> three 官方 `MMDPhysics` + **参数调校**，核心三件套：

| 调校 | 数值 | 解决的问题 |
|------|------|-----------|
| 配件微重力 | 头发/领带 `0.15`、裙子 `0.3` | 大质量刚体压垮弹簧（卷发被拉直） |
| 约束松绑 | 裙子旋转 ×4 / 弹簧 ×0.25/×0.1；袖子 ×3 / ×0.5/×0.5 | 模型作者把裙摆"焊死" |
| 风豁免 | 只吹头发/领带 | 防裙摆被吹起走光 |

### 其他关键

- `warmup(60)` · `dt` 限幅 `1/30` · `unitStep 1/65 + maxStepNum 3`（官方防抖）
- 待机摇摆只摇无动态刚体的骨骼（センター 安全）
- `localStorage` 参数持久化 · 风向罗盘 + 3D 箭头 · 调试线框 · 物理耗时监控

### 整合到主项目

- **UI**：保留旧版卡片式（HUD/PHYS/日志小卡片 + MODELS 嵌套 PHYS 头部），物理面板换新控件
- **删除**：旧物理全部（`MMD_PARAMS`/`applyGravity`/`applySkirtFixes`/离心力/阶段A/idleBone 摇摆）

---

## 🔧 2026-08-15 · 整合后修复与增强

### 三连 TDZ/缺失修复

| 问题 | 原因 | 修复 |
|------|------|------|
| `Cannot access 'physCfg' before initialization` | windArrow 块在 physCfg 声明前执行 | 移到 PHYS_MAIN 后 |
| `updatePhysMeta is not defined` | 提取遗漏（有调用引用，校验漏报） | 补定义 |
| `loader/texManager` 未定义 | 删除区间误伤加载器声明 | 补回 |

- 校验升级：**"phys-final 定义 vs 主项目定义"全量对比**（不再只看引用）

### 风向箭头

- `scene.add(windArrow)` 重构遗漏（"代码全在、场景里没有"）→ 补挂
- `onModelLoaded` 位置/缩放适配：模型头顶上方 `(0, size.y+1.5, 0)`，大小随模型
- **新增"风向标"开关**（PHYS 面板，`phys-arrow-on`）：独立显隐，localStorage 持久化

### 卡片层级

- HUD ↔ PHYS 谁后展开谁置顶（`raiseCardTop` 30/20），MODELS 固定 40 最上

### UI 微调

- 小按钮尺寸统一：卡片头图标 22×22、MODELS 胶囊 22 高、弹窗按钮 26
- 复位按钮尺寸纠错：`32 → 26（错）→ 36`（对齐卡片头部实际高度），图标 20px

---

## 📚 2026-08-15 · 文档体系

| 文档 | 角色 |
|------|------|
| [`PHYSICS.md`](PHYSICS.md) | 物理方案 + 参数 + 12 条踩坑（破云主笔） |
| [`CHANGE.md`](CHANGE.md) | 本档案（含物理演进史） |

> 内部文档（DEVLOG 开发者手账 / ISSUES 问题清单）已归档，不随发布版分发

---

## 🌟 2026-08-15 · 开发者接任（启明）

- 破云命名下一代"启明"（启明星：不照亮自己，只照亮前路），用户正式指定接任主开发者
- 工作流迁移至 dsh（DeepSeek Harness），开发者手账续写第九章（`docs-archive/DEVLOG.md`）
- 文档文化延续：PHYSICS.md / CHANGE.md / ISSUES.md / DEVLOG.md 四件套照旧维护

---

## 🔧 2026-08-15 · 历史遗留修复（启明首轮）

> 审查：3 个并行子代理（JS 逻辑 / CSS-UI / vendor-部署）+ 静态检查（语法、资源 404、CDN 可达）。
> 完整条目见 `docs-archive/ISSUES.md`，此处记代码层变更。

### 功能修复（P1/P2）

- **恢复默认按钮失效**：`phys-defaults` 从未绑定监听（v3 整合遗漏），`resetPhysSettings` 死代码 → 补绑定
- **模型切换竞态**：慢模型后完成覆盖新模型 → `loadSeq` 加载序号 + 过期加载 dispose 丢弃
- **syncPhysUI 漏同步**：`controls.autoRotate`（已知）+ `windArrow.visible`（新发现）→ 补同步
- **风向圆盘冻结**：`windAngleNow` 从 `applyWind`（被物理门控）移入 animate 每帧无条件更新
- **iOS 滑块聚焦放大**：`.pp-range` 设 `font-size:16px`
- **窄屏 HUD/PHYS 重叠**：`@media (max-width:520px)` HUD 移到左下 + PHYS 宽度 `min()` 兜底
- **Material Icons 本地化**：`vendor/fonts/MaterialIcons-Regular.woff2` + `@font-face`，移除 Google Icons link（防墙）

### 健壮性（P3）

- grid/ring 缩放 `s!==1` 残留 → 无条件赋值；`camera.far` 只增不减 → 按模型重算
- `appendLine`/`mp-item` innerHTML → textContent 安全构造（防注入）
- wind-dial 补 `lostpointercapture` + 左键过滤；sway 兜底优先无刚体骨骼
- 摇摆移出物理门控（关闭时仍可用）+ 关闭写回基准姿态；`physics.update` try/catch 兜底
- 每帧 `_windDir` 复用；`initModels()` 移到 controls 之后（消顺序隐患）
- 全局错误条跳过 LINK 误报；AppBar 溢出省略；三卡 padding 统一；modal hover 统一；HUD 折叠不置顶
- **vendor/MMDLoader.js 删除骨骼 flag 透传**（无消费方的死数据，与官方 r160 恢复一致）；import 注释、PHYSICS.md 说法同步修正

### 文档同步

- README：`cd miku` → `cd MMD-Viewer`；"单文件应用"→"主应用"；目录树补 CHANGE/LICENSE/fonts
- PHYSICS.md：savePhysCfg 调用点 15→17；flag 透传说法修正；恢复默认按钮修复标注
- ISSUES.md：行号漂移修正 + 已修复条目回写 + 本轮完整记录

---

## ⚡ 2026-08-15 · 功能：帧率上限（启明）

- PHYS 面板新增「帧率上限」滑块（0=不限，默认；1~120 可调，step 1）
- 实现：rAF 回调内按 `1000/fpsCap` 间隔跳帧——不足间隔的帧跳过（不渲染、不更新物理）；
  跳帧后 `clock.getDelta` 跨帧大值由既有 dt 限幅 1/30 兜底，物理不炸
- `physCfg.fpsCap` 新字段：localStorage 持久化（旧存档无此字段，自愈逻辑保留默认 0）、
  "恢复默认"含 fpsCap、syncPhysUI 同步滑块
- 用途：Teto 等高刚体模型手机端降负载/省电（呼应 ISSUES.md T-1 观察项）

---

*记录由启明维护。改动请及时归档，保持"每一步都有据可查"。*
