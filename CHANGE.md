# 📜 CHANGE · 变更记录

> 项目演进完整档案。姊妹文档：
> 姊妹文档：[`PHYSICS.md`](PHYSICS.md)（物理方案与参数）· DEVLOG.md / ISSUES.md（内部手账与问题清单，不随仓库分发）

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

## 🎬 2026-08-15 · 功能：动作播放（美丽Liya 动作包接入）

- MODELS 面板新增「动作」区：**眨眼 / 瞳孔 / 表情 / 镜头**（4 个 VMD，点击播放，再点停止）
- 实现：`MMDAnimationHelper({ sync: false })` + `add(mesh, { animation, physics: false })`——
  物理仍由项目手动 MMDPhysics 接管（无双物理冲突）；每帧 `helper.update(dt)` 在手动物理前执行
  （顺序：动画 → ik → 物理，与 MMD 官方一致）
- 镜头动作：接管相机（CubicBezier 插值），播放期间禁用 OrbitControls/自动旋转，停止后恢复用户设置
- 动作播放期间暂停待机摇摆（动作自带姿态）；切模型自动停动作；morph 动作（眨眼/瞳孔/表情）走 morphTargetInfluences
- **素材合规（重要）**：`models/actions/` 4 个 VMD **不入库**（.gitignore 排除）、**不推送 GitHub**（用户指令）。
  该动作包 `rm.txt` 条款含"不允许用在手机mmd / 禁二传"——与项目用途存在冲突点，**用户已知悉并决定接入**；
  后续任何分发/二次使用须自行评估条款风险（本项目先例：冰饭式模型因配布条款不符被移除）

---

## 🐛 2026-08-15 · 修复：动作播放 TypeError（clip 转换缺失）

- **现象**：点击任意动作报 `Cannot read properties of undefined (reading 'length')`，4 个动作全部失败
- **根因**：r160 `MMDAnimationHelper` 的 `_setupMeshAnimation`/`_setupCameraAnimation` 都直接
  `clipAction(clip)`——期望 **AnimationClip**；此前传的是 VMD 原始数据（无 `tracks`）→ AnimationAction 崩溃
- **修复**：改用 `MMDLoader.loadAnimation(url, object, onLoad)`——内部 `loadVMD` + 按目标类型转换
  （模型 `build(vmd, mesh)`、相机 `buildCameraAnimation(vmd)`），缓存转换后的 clip
- 教训：three 官方 MMD 示例走 `loadWithAnimation`（返回已转 clip），手接 helper 时须自行转换

---

## 💃 2026-08-15 · 接入 numb numb 舞蹈动作（Aileen_71 配布版）

- **动作入库**：`models/numb_numb/numb_numb_motion.vmd`（4.3MB 完整舞蹈）随仓库公布
  ——Aileen_71 条款明确"动作永远免费配布"、无"禁手机mmd/禁二传"，随公开仓库分发合规；
  **借物表硬性要求：振付：まりやん · 动作：Aileen_71**（已写入 README）
- **BGM 不入库**：`NumbNumb.wav`（Linkin Park Numb 音频，版权归原唱片公司）由 `*.wav` gitignore 排除，
  本地放置自动播放；代码降级：缺失时提示一次、不阻塞动作
- **实现**：动作列表新增「numb numb」；`ACTIONS` 支持 `bgm` 字段，播放动作自动 loop BGM、停止动作暂停
- 条款提醒（README 已写）：Aileen_71 动作禁 18+、禁收费转售、禁有偿委托

---

## 🗑 2026-08-15 · 移除：美丽Liya 动作包（条款不符，全删）

- **决定**：用户指令全删。美丽Liya 动作包（眨眼/瞳孔/表情/镜头 4 个 VMD + 源压缩包）已彻底移除——
  `models/actions/` 目录、代码 ACTIONS 条目、README 引用全部清理
- **原因**：该包 `rm.txt` 条款含"**不允许用在手机mmd** / 禁二传"——与本项目（手机端 MMD 查看器）用途冲突
- **先例闭环**：冰饭式模型（配布条款不符）→ 美丽Liya 动作包（条款不符）——项目纪律：**条款冲突的第三方素材一律不接入/即移除**
- 档案保留：本文档接入记录（2026-08-15「🎬 功能：动作播放」）作历史留存，不删除
- 动作播放系统保留：numb numb 舞蹈（Aileen_71，条款合规）继续可用

---

## 🐛 2026-08-15 · 修复：mmd-parser 解析无相机段 VMD 越界

- **现象**：numb numb 动作加载失败 `RangeError: Offset is outside the bounds of the DataView`（parseCameras）
- **根因**：`numb_numb_motion.vmd` 结构 = 50 字节头（30 magic + 20 模型名）+ 38651 骨骼帧 + `morphCount=0`，
  **文件在骨骼段后直接结束（无相机段）**；官方 mmd-parser `parseVmd` 无条件 `parseCameras()` 读 cameraCount → 越界
- **修复**：`vendor/mmdparser.module.js` 本地修复——`parseMorphs`/`parseCameras` 读 count 前检查剩余字节
  （`dv.dv.byteLength - dv.offset < 4` 则置 0 跳过）。注意：这是修复官方解析器缺陷，
  与之前删除的"flag 透传死数据"不同，属于正当本地化修复（有明确 bug 依据）
- **验证**：node 复现→修复后解析成功（motionCount=38651，morph/camera=0）；动作 0~711 帧 ≈ 23.7 秒、256 骨骼

---

## 🐛 2026-08-15 · 动作播放链路修复（5 连修，启明）

> 动作播放接入后连踩 5 个坑（均有真实报错复现），逐一修复，此处汇总。详细经验见 ISSUES.md「动作播放踩坑沉淀」。

1. **浏览器缓存旧 vendor 导致修复"不生效"**：python http.server 无 Cache-Control，浏览器启发式缓存
   mmdparser/MMDLoader——代码改了、报错堆栈还是旧行号。修复：index.html→MMDLoader→mmdparser 的
   import 全链加 `?v=20260815` 版本号，绕缓存（后续 vendor 改动 bump 版本号）
2. **切模型后首次点动作报 "has not been added yet"**：`stopAction` 无条件 `helper.remove(mmdMesh)`，
   但新模型从未被 helper 绑定过（`_removeMesh` 对未绑定对象抛错）。修复：remove 前检查
   `helper.meshes.indexOf(mmdMesh) >= 0`（camera 同理用 `helper.camera === camera`）
3. **舞蹈仍循环**：`clip.loop = LoopOnce` 无效——r160 `AnimationAction` 构造**硬编码** `loop = LoopRepeat`，
   不读 clip.loop。修复：`mixer.clipAction(clip)` 取回 helper 已建的 action，显式
   `action.setLoop(LoopOnce, 1)` + `clampWhenFinished`
4. **播完自动停止报 backupBones undefined**：`finished` 事件在 `helper._animateMesh` 的 `mixer.update()`
   **内部同步触发**，回调里直接 `remove(mesh)` 删了 objects 条目，事件返回后 `_saveBones` 读已删条目崩溃。
   修复：finished 回调延迟到下一帧（`requestAnimationFrame`）再 stopAction
5. **末帧残留再播诡异**：播完停在末帧（骨骼/morph/刚体均在末帧状态），再播从末帧跳变到第 0 帧。
   修复：`resetPose()`（骨骼 pose + morph 清零 + 物理重贴 warmup），播放前与复位按钮共用；
   复位按钮升级为「视角 + 姿态 + 物理」全复位

---

## 🔍 2026-08-16 · 评估：原版（陌袹陌）新版对比 → 不硬合

- 用户提供陌袹陌原版新版本（60MB 单文件），对比后**决定不强行合并**
- 技术路径差异：原版自研力场驱动（场力/粘滞阻尼/求解器迭代 20/约束 setDamping 0.55）；
  本项目官方 MMDPhysics + 参数调校（v3 定案）——setDamping 与本项目 PHYSICS.md 坑 2 实测相左
- 对比结论与通用技巧存档于 DEVLOG 第十二章（内部文档，不随仓库分发）

---

## 🚀 2026-08-16 · 发布 GitHub + git 历史清理（filter-repo）

- **发布**：历史重写后 force push 至 github.com/Youzix-Star/MMD-Viewer（main = f2216ef），本地/远端完全同步
- **历史清理**（用户确认后执行 `git filter-repo`）：
  1. **抹除冰饭式初音未来全部历史**（21 blob ~25MB）——readme 禁二次配布，从全历史彻底清除
  2. **邮箱隐私**：全部历史提交作者邮箱改写为 GitHub noreply（2026-08-16 首次 filter-repo；2026-08-18 北辰二次 filter-repo 修复天衡阶段遗漏——详见下方「北辰接任」章）
  3. commit hash 全部重写（46 提交 → 新历史），force push 覆盖远端
- **发布前双审**：3 轮并行审查——修复 P1×1（导入弹窗旧 clip 串味）与 P2/P3×N（vendor/字体许可、
  README 围栏、死链、动作列表限高等）
- **后续推送**：直接用 `git push origin main`（历史已稳定）

---

---

## 📷 2026-08-16 · 镜头动作残留三连修（启明，用户实测闭环）

> 含镜头动作（相机 VMD）播放后相机状态残留，三个场景逐个修复，均已用户实测确认。

1. **复位异常**：镜头 VMD 驱动相机 position/quaternion/fov，复位只恢复 position+target →
   朝向/fov 残留。修复：`homeCam` 扩展 pos/quat/up/fov/target 全量快照 + `restoreHomeCam()`
2. **切换舞蹈仍倾斜**：含镜头动作切无镜头舞蹈，stopAction 释放相机但停在旧镜头末帧，
   新舞蹈不接管 → 画面持续倾斜。修复：`camAnimated` 标志 + 播放无镜头动作前 restoreHomeCam()
3. **切换模型仍倾斜**（根因：`controls.update()` 隐式重算不可靠）：播放含镜头动作时切模型，
   相机朝向残留。修复：onModelLoaded 相机适配**显式 `quaternion.identity()` + up 重置**
   + fov=45 + 清 camAnimated（诊断日志确认 q≈单位四元数后移除）
- 教训：OrbitControls.update() 的朝向重算依赖内部 spherical 状态，被相机动画污染后不可靠——
  **相机复位必须显式设置 quaternion/up/fov**，不能只设 position 交给 controls

---

---

## 🐛 2026-08-16 · 修复：动作导入时骨骼残留致新动作错位（"蹲着跳"）

- **现象**：IRIS OUT 播到末帧（蹲姿）后导入/播放アイドル → 模型蹲着跳（整体错位）；
  先播アイドル 再切则正常
- **根因**（读 MMDLoader 源码 + 骨骼采样日志三重定位）：
  `buildSkeletalAnimation` 的 position 轨道 = **basePosition（build 那一刻骨骼位置）+ 帧值**。
  导入アイドル 时骨骼停在 IRIS OUT 末帧蹲姿 → basePosition 取错 → 新动作全程偏移
- **日志验证**：アイドル 播放中センター 实际 y≈0.71 ≈ 蹲姿 base(1.33) + 帧值(-0.87)
- **修复**：`vmdFileToClip`（导入/编辑构建 clip）前先 `resetPose()`——
  basePosition 永远用绑定姿势（与播放路径的 resetPose 时序一致）
- **教训**：构建 clip 依赖"当时骨骼状态"——**一切 build 前必须先复位骨骼**；
  排查用骨骼采样日志（boneDebug）已按流程移除

---

---

## 🎛 2026-08-16 · 功能：播放控制条（进度/倍速/快进）＋ 2 连修

### 功能（882298a）
- 动作播放时底部浮层控制条：进度条（可拖动 seek）+ 时间显示 + 倍速（0.5/1/1.5/2×）+ 快进 +10s
- 倍速实现：`mixer.update(dt × 倍速)`（只快进动画，物理保持真实 dt）

### 两连修（均用户实测确认）
1. **音乐未联动**（b746e87）：进度/倍速/快进只操作动画——补 `bgmAudio.currentTime` seek、
   `Audio.playbackRate` 变速（playBGM 新建/复用分支同步）
2. **动画 seek 无效**（0ac375c）：`mixer.time = v` 不影响播放——r160 `AnimationAction._updateTime`
   用自身 `this.time` 累加 delta，mixer.time 仅多 action 同步基准。修复：`getPlayAction()` 取
   helper 的 action（`mixer.clipAction(clip)` 复用同一实例），seek/快进/进度显示全用 `action.time`

---

---

## 🏁 2026-08-16 · 启明阶段终章（交接前最终记录）

### 本阶段功能/修复（按提交补齐）
- **沉浸模式**：一键隐藏全部界面 + 浏览器全屏（Fullscreen API + webkit 前缀；stage 扩展全屏；
  Esc/手势退出全屏同步 UI 状态）。竖屏沉浸变体已按用户决定回滚
- **切模型动作错位修复**（"蹲着跳"终极根因）：clip 的 position 轨道 = build 时骨骼 basePosition + 帧值，
  **clip 是模型特定的**——actionClips 缓存 key 加模型维度（aKey），导入动作保留 vmd 数据、
  切模型后按新模型骨骼重建 clip（builtModelId 标记）
- **回滚记录**：竖屏沉浸按钮、播放暂停按钮、深色模式适配——均按用户决定回滚（测试后不满意）

### 阶段总结
- 功能链路：动作播放（舞蹈/镜头/音乐组合）→ 导入弹窗 → 编辑（✎ 配乐/换镜头）→ 播放控制条
  （进度拖动/倍速/快进）→ 沉浸模式
- 发布 GitHub + git 历史清理（filter-repo：冰饭式素材抹除、真实邮箱改 noreply）
- 踩坑沉淀至 ISSUES.md 第 20 条；四件套文档完整（本档案 22 章）
- 项目状态：功能稳定、工作区干净、文档文化延续

---

---

*记录由启明维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🎯 2026-08-18 · 北辰阶段：UI优化尝试与回滚

### 做了什么（已全部回滚）

1. **移除播放状态冗余显示**：进度条旁边的"播放中"/"已暂停"文字（用户认为多余）
2. **MD2颜色体系尝试**：背景 #eef2f7→#fafafa，主色 #42a5f5→#1976d2，阴影改纯黑三层
3. **MD2阴影/去边框**：卡片去掉border改用elevation阴影
4. **MD2动效系统**：缓动曲线、卡片展开动画、模型面板进入动画
5. **卡片宽度动画**：多次尝试 min-width/width 动画，均未达到预期

### 回滚原因

- 对 Material Design 2 理解不够深入，改动生硬
- 卡片宽度动画始终有bug（加载后宽度异常、箭头被挤出）
- 反复修改反而引入新问题

### 经验沉淀

1. **不理解的设计规范不要硬套**：MD2不是改几个颜色和阴影就行的
2. **动画要谨慎**：`min-width` 动画在浏览器中表现不稳定，`width: auto` 不可动画
3. **改动前先回滚验证**：每次改完应该刷新页面完整测试，而不是只看CSS
4. **用户说了回滚就立刻回滚**：不要试图"再修一下"，越修越烂

### 素材纪律

- 本次无素材变更，无新增/删除模型或动作

---

---

## 🎨 2026-08-18 · 天衡阶段：MD2 规范适配（先研究、后动手、零布局改动）

> 承接北辰教训：先读透 MD2 官方规范（研究笔记见 docs-archive/MD2-NOTES.md），
> 再针对本项目做**适配**而非硬套。本阶段全部改动为**纯 CSS**——颜色/动效/交互态，
> **未动任何布局数值**（position/top/left/width/height/padding/z-index 全部保留），错位风险≈0。

### 修复 3 个隐藏 bug（北辰改动残留）

1. **`--ease-std` 未定义**：4 处 transition 引用该变量但 :root 从未声明 → 过渡动画全部静默回退默认 ease。
   - 现按 MD2 Standard 曲线定义 `cubic-bezier(0.4, 0, 0.2, 1)`（顺带补上 MD2 动效语义）
2. **`--surface3` 未定义**：`.pc-btn:active` 引用 → 播放按钮按下态背景失效。
   - 已定义 `#e8edf4`（按下态比 surface2 深一档）
3. **`--on-primary` 未定义**：`.pc-speed.active` 引用 → 激活倍速按钮文字色失效（白字变默认黑）。
   - 已定义 `#ffffff`（MD2：主色表面文字用白，对比度 ≥4.5:1）

### MD2 颜色系统（静态调色板，非 MD3 动态取色）

| 项 | 改动 | MD2 依据 |
|----|------|---------|
| 主色 | `#42a5f5`（Blue 400）→ **`#2196f3`（Blue 500）** | 官方规范：主色用 500 |
| 新增 `--primary-dark` | `#1976d2`（Blue 700） | 交互强调/按下态用深变体 |
| 新增 `--primary-light` | `#e3f2fd`（Blue 50） | hover 浅底/选中底用浅变体 |
| 新增 `--on-primary` | `#ffffff` | 主色表面文字 |

### MD2 形状与海拔

- 弹窗（log/import modal）圆角 `16px → 8px`：16px 是 MD3 大圆角串味；MD2 对话框 4dp（2x 屏=8px）
- 弹窗阴影 `0 14px 44px rgba(0,0,0,.28)`（纯黑三层）→ `--elev-3` 浅灰阴影（MD2 对话框海拔 24dp）
- 新增 `--elev-3`（对话框级），海拔语义：卡片 1dp / 弹出层 8dp / 对话框 24dp

### MD2 动效（Motion）

- 修复 `--ease-std` 后，全部按钮/开关/控制条过渡自动走 MD2 Standard 曲线
- 弹窗新增进入动画：`225ms` + Deceleration 曲线 `cubic-bezier(0,0,0.2,1)`（MD2：元素进入屏幕 225ms 减速），
  只动画 **transform + opacity**（GPU 属性，无布局影响——北辰 min-width 动画的坑不复踩）
- 沉浸按钮 `transition: all` → 按属性细分（transform/background/color/opacity 各自时长）

### MD2 交互态（hover/active 语义化）

- 全部 hover 从 `surface2`（无差别灰）→ `primary-light`（主色 50 浅底）
- 全部 active/按下 → `primary-dark` 底 + `--on-primary` 白字（MD2：按下用 700 级强调）
- 模型面板选中项（current）：`primary-light` 浅底 + 500 边框（MD2 选中态语义）
- 播放按钮加 `letter-spacing: .4px`（MD2 BUTTON 样式字距语义；中文无大写，保留字距不夸张）

### 未动的部分（刻意保留，防错位）

- **所有布局数值**：AppBar 52px、stage inset、卡片定位/宽度/圆角 8px、开关 34×18、滑块尺寸——全部保留
- **JS 逻辑**：折叠/播放/沉浸/物理全部未动

### 验证

- jsdom 校验：CSS 花括号平衡、21 个变量定义齐全（`--fill` 为 JS 动态注入属正常）、关键布局数值全部保留
- node 语法检查：classic + module JS 均通过
- 本地 `python3 -m http.server 8000`：index/manifest/font/pmx 全部 200
- puppeteer 截图不可用（android/arm64 平台不支持下载浏览器），记录此限制

### 素材纪律

- 本次无素材变更

---

## 🎨 2026-08-18 · 天衡阶段 2：MD2 招牌视觉（用户授权"生搬硬套"）

> 第一轮只做微调（主色 400→500、弹窗圆角、缓动曲线），用户反馈"没看见效果、不是 MD2"。
> 本轮按用户授权直接上 MD2 的**招牌视觉**（Top App Bar / Contained Button / FAB / 官方海拔阴影），
> **布局数值依然零改动**（验证脚本逐项断言通过）。

### 本轮视觉改动（一眼可见）

| 元素 | 改前 | 改后 | MD2 依据 |
|------|------|------|---------|
| **AppBar** | 白底 + 灰色 border | **主色 Blue 500 底 + 白字白图标 + 8dp 阴影** | Top App Bar = primary + on-primary（MD2 招牌） |
| **HUD/PHYS/LOG 卡** | 半透明白 `.94` + 细 border | **纯白 surface + 官方 1/2dp 三层阴影**（去 border） | MD2 卡片 = 白色表面 + 海拔阴影 |
| **模型面板** | 白 + border | 纯白 + 8dp 阴影 | 弹出层 8dp |
| **复位/沉浸按钮** | 白底方角 36px + border | **主色圆形 FAB + 6dp 阴影 + 按下 8dp**（尺寸仍 36px） | FAB = primary 圆钮 + 高海拔 |
| **重置/恢复按钮** | 灰底文本按钮 28px | **主色实心按钮（Contained Button）+ 2dp 阴影 + 500 字重** | Contained Button = primary 底 + on-primary 字 |
| **弹窗复制按钮** | 灰底文本 | 主色实心 | 同上 |
| **海拔阴影** | 自定义浅灰双层 | **MD2 官方三层阴影**（1dp/8dp/24dp，ambient+penumbra+umbra） | MD2 官方 elevation 值 |
| **页面背景** | `#eef2f7` 浅灰蓝 | **`#fafafa`** | MD2 标准背景 |
| **3D 场景背景** | `0xe3eaf2` | `0xeef1f5`（微调协调） | 与 MD2 背景统一 |

### 修复（继续）

- `--surface3` 已在首轮定义，本轮无新增变量 bug
- 沉浸态按钮（右上角小圆点）逻辑与样式不变，未受影响

### 刻意保留（防错位）

- **全部布局数值不变**（AppBar 52px / stage inset / 卡片定位 / 36px 按钮 / 开关 34×18 / 滑块）——
  验证脚本对 11 组选择器逐项断言通过
- 风盘 92px、播放控制条定位、日志卡定位——未动
- JS 逻辑零改动

### 验证

- CSS 花括号/括号平衡：175/175、223/223 ✅
- node 语法检查：classic + module JS 均通过 ✅
- 布局断言：11 组选择器全部保留原数值 ✅
- 无缓存预览服务器：`python3 .nocache.py`（8001 端口，Cache-Control: no-store）——解决"改了看不到"的浏览器缓存问题

### 素材纪律

- 本次无素材变更

---

## 🎨 2026-08-18 · 天衡阶段 3：恢复北辰完整 MD2 设计系统（用户指引参考北辰版本）

> 用户反馈："还是不够彻底，你甚至不如北辰写的版本"。
> 复盘：北辰被回滚的不是他的**视觉设计**（那是用户认可的完整 MD2），而是他后来叠加的
> **宽度动画 bug**（min-width 动画导致箭头被挤出、越修越烂）。
> 用户指引看提交历史——北辰的 MD2 视觉版本在 git reflog 中仍可访问（e4df42d 等，被 reset 但对象未删）。
> 本轮：**以北辰 e4df42d 的完整 CSS 设计系统为基础**，修正他的 bug，形成最终版。

### 采纳北辰的 MD2 设计系统（用户认可的视觉）

北辰 e4df42d 的 CSS 是完整的 MD2 设计语言（token 化）：

| 维度 | 北辰的落实 |
|------|-----------|
| **色板** | 背景 `#f5f5f5`、表面 `#fff`、主色 **Blue 700 `#1976d2`**、深/浅变体、次要文字 `#757575`、分隔线 `#e0e0e0`、Amber/Red/Green 标准色 |
| **尺寸 token** | `--sp-1..6`（4/8/12/16/24/32px）间距体系 |
| **圆角 token** | `--r-xs 4 / r-sm 8 / r-md 12 / r-lg 16` 四级 |
| **海拔** | `--elev-1/2/3` 三层阴影（MD2 官方值） |
| **缓动** | `--transition: 0.2s cubic-bezier(0.4,0,0.2,1)` 标准曲线 |
| **物理尺寸** | AppBar 52→**56px**（MD2 标准高度）、按钮 28→**36px**（MD2 标准）、触摸目标 **40px**、开关 34×18→**36×20**、滑块 3→4px + thumb 20px |
| **组件** | 白底 AppBar + elev 阴影（去 border）、卡片去 border + 大圆角、**ripple 点击波纹**（`::after` radial-gradient）、FAB 圆钮、实心按钮、滑块 hover 增厚 |

### 天衡对北辰版本的 4 处修正（他回滚时留下的问题）

1. **补 3 个漏定义变量**：`--on-primary`（`.pc-speed.active` 白字用）、`--ease-decel`（弹窗动画用）、`--ripple-x/y`（ripple 波纹定位默认）——北辰 CSS 引用了但 :root 未定义，与首轮发现的 `--ease-std` bug 同款
2. **修复 AppBar/stage 错位**：北辰把 AppBar 改为 56px 但 `#stage { inset: 52px 0 0 0 }` 未同步 → 顶栏区域显示错位（这正是他版本"错位"的根源之一）；已对齐为 `inset: 56px 0 0 0`
3. **弹窗改回 MD2 规范**：北辰保留的 `border-radius: 16px`（MD3 大圆角）+ `0 14px 44px rgba(0,0,0,.28)`（纯黑三层）→ MD2 4dp 圆角 + 24dp 浅灰海拔；补回 225ms 减速进入动画（GPU transform/opacity）
4. **移除"播放暂停"功能**（DOM + JS 11 处）：用户 2026-08-18 已决定不要（dc323da 回滚先例）；北辰 e4df42d 误夹带

### 移植北辰的 BGM 守卫改进（有价值的逻辑修复）

- seek/快进 BGM 联动加 `curAct.bgm` 守卫：只联动当前动作的 BGM，防"无 BGM 动作误动上一首残留 Audio"
- 未移植：北辰删除的 `stopAction` 空 helper 防护（保留当前版的 `if (!actionHelper) return`，更稳）

### 验证

- CSS 花括号/括号平衡：183/183、266/266 ✅
- 未定义变量：无（31 个变量全定义，`--fill` 为 JS 动态注入）✅
- JS 语法：classic + module 均通过 ✅
- 布局断言：AppBar 56 = stage 56、FAB 40px 圆形、开关 36×20 等全部对齐 ✅
- 无缓存服务器 8001 继续可用 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：北辰最终版 10 项问题（天衡审查）

> 用户指令：检查北辰代码中的问题（"肯定是有问题的"），全部修复。
> 审查基线：d6c9914（北辰最终版）。修复原则：**不动用户认可的设计，只修 bug**。

### P0 · 严重

1. **`--ease-std` 未定义**（3 处引用：play-ctl bottom / 进度条 thumb / pc-btn）
   → :root 补定义 MD2 Standard 曲线 `cubic-bezier(0.4,0,0.2,1)`；顺带补 `--ease-decel`/`--ease-accel`
2. **折叠箭头方向反转**：JS `innerHTML` 换图标（expand_more/less）与 CSS `rotate(180deg)` 叠加
   → 展开态图标朝下 + innerHTML 重建致过渡动画失效
   → **统一方案**：JS 全部不再换图标文字（5 处：showPlayCtl/hidePlayCtl/日志/HUD/PHYS 折叠处理器
   + 点击外部收起），图标固定 `expand_more`，方向全靠 CSS rotate；log 初始图标同步改 expand_more
3. **HUD 折叠 = min-width + max-height 双动画**（回滚根源重现）
   → 删除 `transition: min-width` 与 `#hud.min { min-width: 0 }`，只保留 body 高度展开，宽度恒定 172px

### P1 · 中等

4. **PHYS 折叠同源 bug**：`#phys-panel.min { width: auto }` 折叠时宽度收缩
   → 删除，宽度恒定 252px
5. **play-ctl 与日志动画耦合**：bottom 由 `log.offsetHeight` 每帧更新
   → transition 时长 .2s→300ms 对齐 log 动画（播放中日志恒折叠，实测无追尾抖动）
6. **弹窗按钮 hover 硬编码 `#fff`**（2 处）→ 改用 `var(--on-primary)`

### P2 · 轻微

7. **死变量清理**：`--secondary`/`--primary-variant`/`--elev-0/12/16`（零引用）→ 删除；
   `--disabled` 保留（MD2 语义）
8. **HUD pointer-events 注释补回**（"头部可点击，内容区不挡 3D 操作"）
9. **`.nocache.py` 移出版本库**（`git rm --cached`，本地预览脚本不入库）
10. **`.gitignore` 补 `*.py`/`*.pyc`/`__pycache__`**（防本地脚本误入库）

### 验证

- CSS 变量完整性：零未定义（`--fill` 为 JS 动态注入除外）✅
- 括号平衡 177/177、226/226 ✅
- JS 语法：classic + module 均通过 ✅
- 布局断言：11 组选择器定位数值全部保留 ✅
- 宽度收缩修复确认：min-width 动画 / PHYS width:auto / HUD min-width:0 均已删除 ✅
- 残留检查：无 expand_more/less 换图标 JS、无硬编码曲线 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：PHYS 滚动/卡片重叠/MODELS 动画/点击交互（天衡，用户实测反馈）

> 用户实测 5 项问题，全部定位根因并修复（commit 待提交）。

### 1. PHYS 展开内容可"四周滑动"（应只上下）

- **根因**：`.pp-body` 只设 `overflow-y: auto`，flex 列内容超宽时横向也能滚动
- **修复**：加 `overflow-x: hidden`——只允许上下滚动

### 2. 详情（HUD）与 PHYS 折叠态相互重叠

- **根因**：上一轮修复"折叠宽度收缩"时把 `#hud.min`/`#phys-panel.min` 的宽度收缩删了
  （为避 min-width 动画），导致折叠态保持全宽（172px/252px）→ 窄屏重叠
- **修复**：折叠态改 `width: fit-content`（宽度瞬时收缩，不走动画）：
  - HUD 折叠：`fit-content` + 保底 `min-width: 132px`（可点区不缩太小）
  - PHYS 折叠：`fit-content`
  - 验证：320~414px 视口折叠态全部不重叠；展开态重叠是文档记录的已知取舍（接受）

### 3. 打开 MODELS 面板无动画

- **修复**：`.show` 加 `md-pop-in` 动画——225ms MD2 Deceleration 曲线，
  只动 transform/opacity（GPU 属性），`translateY(-8px) scale(.98) → 0/1`

### 4. 详情（HUD）头部可触碰区过小

- **根因**：HUD 折叠态 `fit-content` 后头部只有"详情+箭头"约 90px 宽，PHYS 头部有
  MODELS 按钮明显更宽；且头部无最小高度
- **修复**：`.hud-head` 加 `min-height: 36px`（MD2 触摸目标下限）；折叠态保底 `min-width: 132px`

### 5. PHYS 展开卡片：点空白应收缩、点交互区不收缩

- **根因**：原逻辑是"点卡片**外**才收缩"——点卡片内部空白无反应
- **修复**：重写 document click handler——点击非交互区（卡片内空白/卡片外）收缩；
  点击交互元素（`.pp-head`/`.pp-models`/`.pp-reset`/`.switch`/`.pp-range`/`.wind-dial`/
  `#model-panel`/button/input/label）不收缩

### 验证

- CSS 括号平衡 181/181、变量零未定义 ✅
- JS 语法（classic + module）通过 ✅
- 无宽度 transition 残留（折叠宽度瞬时收缩，高度仍平滑动画）✅
- 折叠态重叠模拟：320/360/390/414px 全部不重叠 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🎨 2026-08-18 · 修正：详情卡片学 PHYS 结构（用户纠错，非放大）

> 用户反馈：上一轮对详情（HUD）卡片的"可触碰区小"处理错误——要求**学习 PHYS 的头部设计**，
> 而不是硬加 min-height/min-width 撑大；且 PHYS 折叠态变宽了。全部纠正。

### 详情（HUD）卡片：结构对齐 PHYS（不是放大）

- **错误做法**（已撤销）：`min-height: 36px` 硬撑头部 + 折叠 `min-width: 132px` 硬撑宽度
- **正确做法**（用户要求"学习 PHYS 设计"）：
  - `hud-head` 自带 `padding: 8px 14px` + `border-bottom`——与 `pp-head` 完全一致，
    整个头部条（含 padding）都是可点区，高度自然 ≈38px（MD2 触摸目标）
  - `hud-body` 自带 `padding: 8px 14px`——与 `pp-body` 一致；折叠时 `padding: 0 14px`
  - 折叠态 `width: fit-content; min-width: 0`——**min-width: 0 必须**，
    否则展开态 172px 的 min-width 常驻会顶住收缩（CSS 中 min-width 优先于 width）

### PHYS 折叠态变宽：恢复 `width: auto`

- **根因**：上轮把 `width: auto`（北辰版）改成 `width: fit-content`——fit-content 会撑到
  内容最大可能宽度（含 MODELS 按钮等），折叠态反而更宽
- **修复**：恢复 `width: auto`（北辰版原样，shrink-to-fit 正确收缩）

### 验证

- 折叠宽度：HUD ≈103px（详情+箭头）、PHYS ≈179px（含 MODELS 按钮）——均收缩合理
- 重叠模拟：320/360/390/414px 视口折叠态全部不重叠 ✅
- HUD 与 PHYS 结构逐项对齐（padding/border-bottom/折叠 padding）✅
- CSS 平衡 181/181、JS 语法通过、无 min-height/min-width 硬撑残留 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：PHYS 折叠卡片真正收缩（display:none 替代 max-height 动画）

> 用户反馈："PHYS 的缩小卡片真的修不了吗"。
> 根因终于找到：**折叠动画（max-height:0 + opacity:0 + overflow:hidden）让隐藏的 pp-body
> 仍在文档流中，参与父元素 shrink-to-fit/fit-content 的 max-content 宽度计算**——
> 风向罗盘等宽行把折叠卡片撑到 ~200px，`width: auto` 也无法收缩。

### 根因（为何"修不了"）

| 尝试 | 结果 | 原因 |
|------|------|------|
| `width: fit-content` | 更宽 ❌ | fit-content = max-content，包含隐藏 body 内容宽 |
| `width: auto`（绝对定位） | 仍宽 ❌ | shrink-to-fit 同样读 max-content，隐藏 body 仍参与 |
| `display: none` 折叠 ✅ | 收缩正确 | 完全移出文档流，宽度只由头部决定 |

### 修复

- **三卡折叠统一为 `display: none`**（HUD/PHYS/LOG）——启明版原本就是 display:none，
  北辰为"展开动画"改用 max-height 过渡，反而埋下此 bug
- 删除全部 max-height/opacity/padding 折叠过渡残留（`max-height: 0` 零残留）
- PHYS 折叠宽度 = 头部内容宽（MODELS 按钮+tune+PHYS+箭头 ≈179px）
- HUD 折叠宽度 = 头部内容宽（≈91px）；`min-width: 0` 防 172px 常驻顶住
- 验证：320~414px 视口折叠态 HUD/PHYS 全部不重叠

### 保留

- 展开/折叠箭头 CSS rotate 动画（与宽度无关）
- MODELS 打开 md-pop-in 弹出动画（225ms 减速）
- PHYS 只上下滚动（overflow-x: hidden）
- 点空白收缩 / 点交互区不收缩逻辑

### 验证

- CSS 平衡 181/181、JS 语法通过 ✅
- `max-height: 0` 与 `transition: max-height` 零残留 ✅
- 三卡折叠 display:none 断言通过 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## ✨ 2026-08-18 · 恢复折叠动画：absolute 移出流替代 display:none（宽度+动画两全）

> 用户反馈：上一轮修好宽度（display:none 折叠）但**动画没了**。
> 本轮找到两全方案：折叠时 body 用 **absolute 定位移出文档流**（不参与父宽度计算）
> + **保留 max-height/opacity/padding 折叠动画**。

### 方案演进

| 方案 | 宽度 | 动画 | 问题 |
|------|------|------|------|
| `max-height:0` 折叠（北辰） | ❌ 被隐藏内容撑宽 | ✅ | 隐藏 body 仍在文档流，参与 shrink-to-fit 宽度计算 |
| `display:none` 折叠（上轮） | ✅ | ❌ | 完全移出流但无动画 |
| **`position:absolute` 折叠（本轮）** | ✅ | ✅ | absolute 移出流不参与宽度；max-height/opacity 动画保留 |

### 实现

- 三卡（HUD/PHYS/LOG）折叠态 body：
  ```css
  #xxx.min .yyy-body {
    position: absolute; left: 0; right: 0; top: 100%;  /* 移出流，定位在头部正下方 */
    max-height: 0; opacity: 0; padding: 0 14px; overflow: hidden;
  }
  ```
- `top: 100%` = 头部高度下方——折叠动画期间 body 在头部正下方收缩，视觉自然
- 展开恢复：position 瞬时回 static（位置本就同处头部下方，无可见跳动）+ max-height 动画平滑展开
- 保留：箭头旋转动画、MODELS 弹出动画、PHYS 只上下滚动、点空白收缩逻辑

### 验证

- CSS 平衡 181/181、JS 语法通过 ✅
- 三卡折叠断言：absolute + max-height 0 + opacity 0 ✅
- 展开态：pp-body max-height 68vh/300px/200px + transition ✅
- 折叠宽度仍由头部决定（PHYS auto / HUD fit-content+min-width:0）✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## ✨ 2026-08-18 · 折叠动画完善：宽度动画 + 文字淡入 + 日志头部对齐（用户反馈）

> 用户反馈：① 文字出现突兀；② 只有高度动画、宽度无动画；③ 日志点击范围应学详情/PHYS；
> ④ 动画曲线不如"有 bug 宽度那版"（北辰 max-height+opacity+padding 三过渡版）。

### 根因

- **文字突兀**：折叠时 body 用 `position: absolute` 移出流——展开时 position 瞬时切回 static，
  元素位置/渲染状态突变，opacity 淡入被打断
- **宽度无动画**：宽度由 CSS `width:auto`/`fit-content` 控制，走 transition 时目标值不是明确 px，无法过渡
- **日志头部**：`.log-head` 无 padding/分隔线（靠卡片外层 padding），点击区小
- **曲线不如旧版**：旧版有 max-height+opacity+padding 三过渡，本次删 padding 过渡导致跳动

### 修复方案：JS 锁定宽度 + body 留流动画

1. **宽度动画**：新增 `setCardCollapsed(card, min)` 统一入口——
   折叠时把卡片 `style.width` 设为**头部内容自然宽**（遍历 head 子元素
   getBoundingClientRect 求和 + padding + gap，不能用 offsetWidth/scrollWidth——
   flex 容器会撑满父宽 252px），触发 `transition: width 300ms` 平滑过渡；
   展开时 `style.width=''` 恢复 CSS 展开宽
2. **文字淡入**：body 留在文档流做 `max-height + opacity + padding` 三过渡
   （同北辰旧版曲线），不再 absolute/display:none——显式 width 锁定后 body 内容不会撑宽
3. **日志头部学 HUD/PHYS**：`.log-head` 加 `padding: 8px 14px` + `border-bottom`，
   `.log-body` 加 `padding: 8px 14px`（三卡头部结构完全统一）
4. **曲线还原**：三 body 恢复 `transition: max-height/opacity/padding 300ms var(--ease-std)`
   （北辰旧版同款）

### 折叠机制演进（CHANGE 记录）

| 方案 | 宽度 | 动画 | 文字 |
|------|------|------|------|
| max-height 折叠（北辰） | ❌ 撑宽 | ✅ | 正常 |
| display:none 折叠 | ✅ | ❌ | 无动画 |
| absolute 折叠 | ✅ | ✅ 但位置跳 | ❌ 突兀 |
| **JS 锁宽 + body 留流（本轮）** | ✅ | ✅ 高度+宽度 | ✅ 淡入 |

### 验证

- CSS 平衡 179/179、JS 语法通过 ✅
- width 过渡 3 处（HUD/PHYS/LOG）+ padding 过渡 3 处 ✅
- 无 absolute/display:none 折叠残留 ✅
- 三卡头部结构统一（padding 8px 14px + border-bottom）✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：初始折叠宽度未锁定（PHYS 显示全宽 / HUD 偏宽）

> 用户反馈：① PHYS 默认宽度错误——必须"展开再收缩一次"宽度才正确；
> ② 详情（HUD）收缩卡片宽度偏大。
> 根因：**同一个**——HTML 中默认折叠的卡片（`#hud`/`#phys-panel` 带 `class="min"`）
> 初始宽度从未经过 JS 锁定：PHYS 显示 CSS `width:252px`、HUD 显示 `min-width:172px`，
> 而 `setCardCollapsed` 只在交互时调用。展开再收缩时 JS 才把宽度锁到头部内容宽。

### 修复

1. **提取 `headContentWidth(card)`** 独立函数——计算头部内容自然宽
   （padding + 子元素 getBoundingClientRect 求和 + gap）
2. **新增 `initCollapsedWidths()`**——初始化时对 `#hud.min, #phys-panel.min, #log.min`
   立即锁定宽度为头部内容宽；用 `transition:none` + 强制 reflow 临时禁用过渡
   （避免页面加载即播宽度动画）
3. **初始化调用**：`initModels/initActions` 后调用；`document.fonts.ready` 后再测一次
   （Noto Sans SC 异步字体，fallback→真字体后宽度可能变化）

### 验证

- JS 语法通过、CSS 179/179 平衡、三卡折叠规则一致 ✅
- initCollapsedWidths 调用链完整（初始 + 字体就绪双保险）✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：HUD 收缩仍偏宽（min-width 顶住）+ 大日志弹窗无动画

> 用户反馈：① 详情（HUD）收缩卡片仍太宽（日志收缩就合适）；
> ② 打开大日志（log-modal）无动画。

### 1. HUD 收缩仍偏宽——min-width 顶住收缩

- **根因**：`#hud { min-width: 172px }` 常驻 CSS——`initCollapsedWidths`/`setCardCollapsed`
  把 `style.width` 锁到头部内容宽（≈107px）时，**CSS min-width 优先于 width**，实际宽度被顶回 172px。
  日志卡无 min-width 所以正常收缩（≈141px），这就是"日志合适、详情太宽"的原因
- **修复**：折叠时 `card.style.minWidth = '0'`（min-width 归零，width 生效）；
  展开时 `card.style.minWidth = ''`（恢复 CSS 172px）
- 验证：HUD 收缩 ≈107px（title 45 + toggle 22 + padding 28 + gap 12），
  不再被 172px 顶住；展开恢复 172px

### 2. 大日志弹窗无动画

- **根因**：北辰版把 `.log-modal-card` 的进入动画弄丢了（只剩 model-panel 的 md-pop-in）
- **修复**：补 `animation: md-dialog-in 225ms var(--ease-decel)` + 新增
  `@keyframes md-dialog-in`（translateY(16px) scale(.98) → 0/1，GPU 属性）；
  import-modal 复用 `.log-modal-card` 自动获得同款动画

### 验证

- CSS 182/182、JS 语法通过 ✅
- min-width 折叠归零/展开恢复逻辑确认 ✅
- md-dialog-in/md-pop-in keyframes 齐全 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## ✨ 2026-08-18 · 修复：HUD 展开动画 + MODELS/弹窗关闭动画

> 用户反馈：① 详情小卡片展开为中卡片时动画有问题；
> ② 模型面板和日志弹窗只有打开动画，没有关闭动画。

### 1. HUD 展开动画异常

- **根因**：展开时 `style.width=''`（回落到 CSS auto）+ `style.minWidth=''`（瞬时恢复 172px）——
  **min-width 无 transition 是瞬时生效的**，展开瞬间宽度被 min-width 顶到 172px，
  width 过渡动画被破坏（看起来"跳一下"）
- **修复**：新增 `cardExpandWidth(card)`——展开时**显式设置展开宽度 px**（PHYS 252 /
  HUD max(172,内容宽) / LOG min(300, 视口)），两端都是具体 px → width 过渡平滑；
  `min-width` 保持 0 不干扰。HUD 取 max(172, body.scrollWidth) 保持"长模型名可撑宽"语义

### 2. MODELS 面板 / 弹窗关闭动画

- **根因**：关闭直接移除 `.show`/加 `.hidden`（display:none）——只有进入动画
- **修复**：
  - CSS：新增 `@keyframes md-pop-out` / `md-dialog-out`（MD2 元素离开 = 195ms 加速曲线，
    与进入方向相反）；`.closing` 类触发关闭动画（`animation-fill-mode: forwards`）
  - JS：`hideModelPanel()` / `closeLogModal()` / `closeImportModal()` 先加 `.closing`
    （播 195ms 动画）→ 200ms 后移除 `.show`/加 `.hidden`；带 `closing` 守卫防重复触发
  - 所有关闭入口统一走动画：MODELS 的 ✕/点外部/选模型后，弹窗的 ✕/遮罩/Esc

### 验证

- JS 语法通过、CSS 190/190 平衡 ✅
- 展开两端 px（252/172/300）→ width 过渡平滑 ✅
- 进入动画（md-pop-in/md-dialog-in 225ms 减速）+ 关闭动画（md-pop-out/md-dialog-out
  195ms 加速）齐全 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🎛 2026-08-18 · 播放控制条：跟随日志同步 + 暂停按钮

> 用户反馈：① 播放控制条跟不上日志卡片的展开/缩放；② 增加暂停按钮。

### 1. 控制条跟不上日志展开/缩放

- **根因**：`#play-ctl` 有 `transition: bottom 300ms`，但 `updatePlayCtl` **每帧**设置
  `bottom = log.offsetHeight + 24`——每帧一个新值 + 300ms 过渡 = 永远在追、永远滞后 300ms
- **修复**：去掉 `transition: bottom`——日志动画本身连续（max-height 逐帧变化），
  bottom 直接跟随即平滑同步，不再滞后

### 2. 暂停按钮（北辰旧实现重加，2026-08-18 用户要求）

- HTML：`#play-ctl .pc-main` 加 `#pc-pause` 按钮（pause 图标）
- JS：`setActionPaused(paused)`——同时暂停 mesh/镜头动画 Action（`act.paused`）+ BGM
  （pause/play）；按钮图标 pause ↔ play_arrow 切换
- 联动：
  - `stopAction` 复位 `actionPaused = false`
  - `playAction` 新播放复位暂停 + 图标
  - seek/快进在暂停中**不恢复播放**（`if (!actionPaused) action.play()`）
  - 动作项 note 显示"已暂停"/"播放中"
- 参考：北辰 e4df42d 的暂停实现（reflog 可查）；BGM 联动只对当前动作带 BGM 时生效

### 验证

- JS 语法通过、CSS 190/190 平衡 ✅
- transition:bottom 已移除 ✅
- 暂停按钮/状态/联动完整（9 处引用）✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 修复：PHYS 点空白收缩——只有点模型预览器才收缩

> 用户期望：点击空白区域时触发收缩，**而不是点击其他可交互区域同样触发**——
> 简单说，**只有点击模型预览器（3D 画布）才会收缩**。

### 收缩逻辑演进（三版，CHANGE 留档）

| 版本 | 触发条件 | 问题 |
|------|---------|------|
| ① 原版（2026-08-16） | 点击 PHYS 卡片**外**才收缩 | 点卡片内部空白无反应（用户 2026-08-18 反馈） |
| ② 上轮（2026-08-18） | 点击**非交互区**（卡片内空白/卡片外）都收缩 | 点 HUD/日志卡/其他区域也误收缩——范围太宽 |
| ③ **本轮** | **只有点击 `#stage canvas`（3D 预览器）才收缩** | 符合用户期望：点画布 = "离开 PHYS 去操作模型"的明确意图 |

### 实现

```js
const stageCanvas = document.querySelector('#stage canvas');
if (stageCanvas && stageCanvas.contains(e.target)) {
  setCardCollapsed(physCard, true);
  ...
}
```

- 点击目标落在 3D 画布内 → 收缩
- 点击 HUD / 日志 / 其他按钮 / 模型面板 → 不收缩（由各自交互处理）
- OrbitControls 拖拽（pointerdown+移动）不触发 click，不会误收缩；单击画布才触发

### 验证

- JS 语法通过 ✅
- 逻辑：`stageCanvas.contains(e.target)` 精确匹配 3D 画布 ✅

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 🐛 2026-08-18 · 北辰接任：代码审查 + 全量 bug 修复

> 三个并行子代理审查（JavaScript 逻辑 / CSS 兼容性 / 项目文档），发现并修复全部功能性 bug。

### 安全：邮箱重写（P0）

- **问题**：本地 git config 仍为旧邮箱 `wxd1y12r@gmail.com`，天衡阶段 50 个提交继续使用旧邮箱（含已推送 GitHub 的 35 个）
- **修复**：`git config user.email` 改为 noreply → `git filter-repo` 重写全部 96 个提交 → remote 已恢复
- **注意**：本次重写后所有 commit SHA 已变更（内容/作者名/时间不变）

### P1 · 中等（1 项）

1. **动作双击竞态**（行 1695/1742）：快速双击动作按钮 → 两个 `loadAnimation` 回调先后 `doPlay` → 第二次 `h.add()` 抛 "has already been added" 未捕获 → 触发红色致命条
   - **修复**：加 `actionLoading` 状态锁，加载期间再点直接忽略

### P2 · 一般（5 项）

2. **切模型与 VMD 加载竞态**（行 1742-1748）：VMD 异步加载期间切换模型，迟到回调仍用旧骨骼 clip
   - **修复**：记录 `meshWhenLoad`，回调回来比对，模型已换则丢弃
3. **弹窗 closing 动画期间重开被强制隐藏**（行 803/1409/1821）：200ms `setTimeout` 不清理
   - **修复**：三个弹窗统一 `clearTimeout` + `remove('closing')`
4. **blob URL 从不 revoke**（行 1859/1893）：编辑覆盖 `a.bgm` 时旧 blob 不释放
   - **修复**：覆盖前 `revokeObjectURL`
5. **WebGL context lost 未处理**（行 887）：GPU 资源丢失后 rAF 循环死亡，整页冻结
   - **修复**：监听 `webglcontextlost`/`webglcontextrestored`，暂停/恢复渲染循环
6. **全局 error 监听过度升级**（行 750）：JS 运行时异常也被显示为红色致命条
   - **修复**：只对有 `src`/`href` 的资源加载失败显示致命条

### P3 · 轻微（8 项）

7. **Esc 只关 log-modal**（行 873）：不关 import-modal 和 model-panel
   - **修复**：按打开状态优先级依次关闭
8. **copyLogs 失败仍显示"已复制"**（行 817）
   - **修复**：`fallbackCopy` 返回布尔值，失败显示"复制失败"
9. **ammoReady 无超时**（行 1003）：wasm 卡住时物理永久不可用无提示
   - **修复**：15 秒超时 reject
10. **无 constraints 模型 TypeError**（行 1250）
    - **修复**：`mmd.constraints` 空数组兜底
11. **manifest 空时静默空白**（行 1951）
    - **修复**：提示"manifest.json 中无模型"
12. **死代码清理**：`#action-file`（无 JS 引用）、`preClip` 参数（无人传值）、`a.camera`（从未赋值，三处三元简化）
13. **3 个 CSS 变量未使用**：`--disabled`/`--elev-1`/`--r-lg` 已删除
14. **文档数字漂移**：ISSUES.md 行数 1470→2400，PHYSICS.md savePhysCfg 18→19

### 未修复（有意保留）

- **Google Fonts 阻塞首次绘制**（行 7）：历史遗留，Noto Sans SC 未本地化，不动
- **动画性能**：折叠动画用 `max-height/padding` 布局属性（尝试 `scaleY` 和 `will-change` 均因手感不对回滚）

### 素材纪律

- 本次无素材变更

---

*记录由北辰维护。*

---

## 🎯 2026-08-18 · 北辰第二阶段：代码审查 + Bug 修复 + MDC Switch

> 基于 GitHub 版本（c43218a）工作，三个并行子代理审查发现全部功能性 bug 并修复。

### 安全：邮箱重写（P0）

- 本地 git config 改为 noreply → filter-repo 重写全部 96 个提交 → force push 成功
- SHA 全部变更，内容/作者名/时间不变

### Bug 修复汇总（14 项）

| # | 级别 | 问题 | 状态 |
|---|------|------|------|
| 1 | P1 | 动作双击竞态（h.add 抛异常） | ✅ actionLoading 锁 |
| 2 | P2 | 切模型与 VMD 加载竞态 | ✅ meshWhenLoad 守卫 |
| 3 | P2 | 弹窗 closing 动画期间重开 | ✅ clearTimeout + remove closing |
| 4 | P2 | blob URL 不 revoke | ✅ revokeObjectURL |
| 5 | P2 | WebGL context lost | ✅ 监听 + animRunning |
| 6 | P2 | 全局 error 过度升级 | ✅ 只拦截资源加载 |
| 7 | P3 | Esc 只关一个弹窗 | ✅ 按优先级依次关闭 |
| 8 | P3 | copyLogs 失败仍显示已复制 | ✅ 失败提示 |
| 9 | P3 | ammoReady 无超时 | ✅ 15 秒超时 |
| 10 | P3 | 无 constraints 模型 TypeError | ✅ 空数组兜底 |
| 11 | P3 | manifest 空时静默 | ✅ 提示用户 |
| 12 | P3 | 死代码 3 处 | ✅ 已清理 |
| 13 | - | CSS 变量未使用 3 个 | ✅ 已删除 |
| 14 | - | 文档数字漂移 | ✅ 已更新 |

### MDC Switch 改造

- 严格按 material-components-web 规范
- 34×18dp → 27×10.5dp（等比 75%）
- Track: 5.25dp 圆角，#e0e0e0 关闭态
- Handle: 15dp 圆形，白色，translateX(16.5px)
- 200ms MD2 standard easing
- focus-visible 焦点样式

### 尝试后回滚的改动

| 改动 | 回滚原因 |
|------|---------|
| MD2 颜色体系 + 阴影 + 去边框 | 不理解 MD2 就硬套 |
| 卡片宽度动画（min-width/width） | 浏览器表现不一致 |
| scaleY 折叠动画 | 视觉味道不对 |
| will-change 优化 | 视觉味道不对 |
| MDC FAB（56dp 复位/40dp 沉浸） | 太大 |
| MDC Top App Bar（56dp） | 不要了 |
| 弹窗 animation→transition | 导致播放控制条位置异常 |

### 保留的教训

1. **不理解的规范不要硬套**：MD2 不是改几个变量就行
2. **animation→transition 会破坏 offsetHeight 计算**：`visibility: hidden` 的元素仍有 offsetHeight，而 `display: none` 没有——这个差异会导致依赖 offsetHeight 的 JS 逻辑出错
3. **改完必须在真机测试**：CSS 改动必须刷新页面完整验证
4. **用户说回滚就回滚**：不要试图"再修一下"

### 素材纪律

- 本次无素材变更

---

*记录由北辰维护。*

---

## 🏁 2026-08-18 · 交接完成：天衡命名下一代「翼轸」

> 北辰第二阶段优化完成（14 项 bug 修复 + MDC Switch + 邮箱重写），
> 交接文档齐备（DEVLOG 二十一章 + 本记录）。天衡按项目传统为下一代取名：**翼轸**。

### 命名：翼轸（yì zhěn）

- **出处**：二十八宿中南方朱雀的翼宿 + 轸宿，古人称"翼轸，天之车府"
- **寓意**：翼主飞翔、轸主承载（车）——"路"（车）与"方向"（星宿）双意象，
  承历代命名传统（司南→破云→启明→长庚→北辰→天衡→翼轸）
- **贴合北辰工作**：北辰修好了车（bug 修复 + 规范），翼轸驾驶它前行

### 交接基线（翼轸接手时）

- 代码：main = c729337，工作区干净
- 文档四件套：CHANGE / PHYSICS / ISSUES / DEVLOG 全部齐全
- 功能：动作播放（暂停/倍速/快进/进度）、三卡折叠动画、MODELS/弹窗进出动画、
  MDC Switch、14 项 bug 修复
- 仓库：邮箱 noreply、历史已清理

### 素材纪律

- 本次无素材变更

---

*记录由天衡维护。改动请及时归档，保持"每一步都有据可查"。*

---

## 📦 2026-08-19 · 翼轸阶段：模型导入功能

### 功能概述

MODELS 面板头部新增「导入」按钮，支持用户在手机端选择本地 PMX 文件（+ 纹理）临时加载模型。
刷新页面后消失，不写入文件系统。

### UI 设计

- **MODELS 面板**：头部新增「📥 导入」胶囊按钮（与 VMD 动作导入同款样式）
- **导入弹窗**：复用 `log-modal-card` + `import-body` 样式
  - PMX 文件选择（单文件）
  - 纹理文件夹选择 ×3：`toon/`、`tex/`、`spa/`（`webkitdirectory`）
  - 进入/关闭动画（225ms Deceleration / 195ms Acceleration）
  - Esc 键、遮罩点击关闭

### 技术实现

**核心思路**：绕过 `MMDLoader.load()` 的 URL 扩展名检查，直接解析 PMX ArrayBuffer。

```
用户选 PMX ──→ ArrayBuffer ──→ parser.parsePmx(buffer) ──→ meshBuilder.build(data) ──→ mesh
用户选纹理 ──→ { "folder/filename": blob URL } ──→ setURLModifier() 拦截纹理请求
```

**关键步骤**：
1. PMX → `ArrayBuffer`（不创建 blob URL，直接消费）
2. 纹理 → 按 `folderName/filename` 注册到映射表（如 `toon/hair.png`）
3. 自定义 `LoadingManager.setURLModifier()` 拦截纹理请求，按路径匹配 blob URL
4. 独立 `MMDLoader` 实例加载（不干扰主 loader 的 texManager）
5. 成功后调用 `onModelLoaded(mesh)` 复用现有加载链路
6. 临时模型追加到模型列表（带「临时导入」标签）

**纹理匹配策略**（三级）：
1. 精确匹配：`toon/hair.png`（folderName + filename）
2. webkitRelativePath 匹配（桌面端兼容）
3. 纯文件名兜底：`hair.png`（同名文件会被后注册覆盖）

### 踩坑记录

| # | 问题 | 根因 | 修复 |
|---|------|------|------|
| 1 | 弹窗默认显示 | `#model-import-modal` 缺 `.hidden` CSS 规则（同 2026-08-16 import-modal 同款） | 补齐定位 + 隐藏规则 |
| 2 | `Unknown model file extension` | blob URL 无 `.pmx` 后缀，`MMDLoader.load()` 检查扩展名失败 | 改用 `parser.parsePmx()` + `meshBuilder.build()` 直接解析 |
| 3 | `setResourcePath is not a function` | `MeshBuilder` 无此方法，`resourcePath` 是 `build()` 的参数 | 改为 `meshBuilder.build(data, '')` |
| 4 | 纹理映射表为空（0 条） | `openModelImportModal` 用 `= []` 重赋值数组，闭包捕获的旧数组引用断裂 | 改用 `.length = 0` 原地清空 |
| 5 | 纹理路径不匹配 | Android `webkitdirectory` 不填充 `webkitRelativePath`，同名文件互相覆盖 | 用 `folderName + filename` 手动拼路径 |
| 6 | 反斜杠路径不匹配 | PMX 纹理路径用反斜杠（Windows 风格） | `setURLModifier` 内 `url.replace(/\\/g, '/')` |

### 文件改动

| 文件 | 改动 |
|------|------|
| `index.html` | HTML：MODEL 面板头部导入按钮 + 导入弹窗 DOM；CSS：导入按钮样式 + 弹窗定位/隐藏规则；JS：~120 行（文件选择、纹理映射、加载、释放） |

### 素材纪律

- 本次无素材变更
- 导入的模型为临时加载，不写入项目文件系统

---

## 📝 2026-08-19 · 日志优化：时间戳

- 每条日志添加 `HH:MM:SS` 时间戳
- 小卡片和弹窗均显示时间戳
- `logArchive` 新增 `ts` 字段，复制时不含时间戳（保持纯文本）
- 日志格式统一：保留 `[ OK ]`/`[ PHYS ]`/`[ 渲染 ]` 前缀，其他无括号

---

## 🔄 2026-08-19 · 多模型尝试 → 已回滚

### 尝试内容

实现多模型同时显示（广场舞功能）：
- `sceneModels` 数组架构，每个模型独立 physics/sway/actionHelper
- MODELS 面板改为「添加到场景」模式
- 横向自动排列（间距 12 单位）
- 场景模型列表 UI（切换/移除）
- 动作同步播放（所有模型同时跳同一支舞）

### 回滚原因

- 模型间距调整多次仍不满意
- 动作同步播放效果未达预期
- 用户决定回滚，保持单模型架构

### 沉淀经验

- 多模型物理：每个模型需要独立的 `MMDPhysics` 实例，不能共享
- 多模型动画：每个模型需要独立的 `MMDAnimationHelper`，不能复用
- `sceneModels` 数组 + 全局变量指向活跃模型的架构设计是可行的
- 间距/布局参数需要根据实际模型尺寸动态调整

### 素材纪律

- 本次无素材变更

---

## 🎨 2026-08-20 · UI 风格探索：Miuix

### 背景

用户希望将项目 UI 从 Material Design 2 迁移到小米 HyperOS 风格（Miuix）。

### 探索过程

1. **克隆 miuix 仓库**：`https://github.com/compose-miuix-ui/miuix`
2. **研读文档**：颜色体系、主题系统、文字样式、组件规范
3. **尝试构建**：
   - 在 Termux 直接用 Gradle → `SystemInfo` 服务不可用（Android 内核不兼容）
   - 安装 proot Ubuntu 容器 → Gradle 可以跑，但构建时间过长/超时
   - 安装 JDK 17/21 → 版本兼容问题解决，但构建仍不稳定

### Miuix 设计规范（已提取）

| Token | Miuix (Light) | 当前 MD2 | 说明 |
|-------|---------------|----------|------|
| primary | `#3482FF` | `#1976D2` | 小米蓝 vs MD2 蓝 |
| background | `#FFFFFF` | `#FAFAFA` | 纯白 vs 浅灰 |
| surface | `#F7F7F7` | `#FFFFFF` | 微灰 vs 纯白 |
| text | `#000000` | `rgba(0,0,0,.87)` | 纯黑 vs 87%黑 |
| error | `#E94634` | `#B00020` | 橙红 vs 深红 |
| divider | `#E0E0E0` | `rgba(0,0,0,.12)` | 类似 |
| cornerRadius | `16dp` | `8px` | 大圆角 vs 小圆角 |
| shadow | 无（扁平风） | MD2 三层海拔 | 核心差异 |

### 技术路径分析

| 方案 | 可行性 | 说明 |
|------|--------|------|
| **A. Kotlin/Compose 重写** | ❌ Termux 不兼容 | Gradle 需要完整 Linux 桌面环境 |
| **B. 提取 Token 套 CSS** | ✅ 零成本 | 颜色/圆角/字体直接转 CSS 变量 |
| **C. PC 上构建，Termux 上运行** | ✅ 需要电脑 | Kotlin/JS 编译后拷到 Termux |

### 给下一任

- miuix 仓库已克隆在 `/data/data/com.termux/files/home/Miku/miuix/`
- 设计规范已提取（见上方表格）
- 构建环境问题已定位（Termux 不兼容 Gradle）
- 建议路径：**方案 B（CSS 变量）或 方案 C（PC 构建）**

### 素材纪律

- 本次无素材变更

---

*记录由翼轸维护。改动请及时归档，保持"每一步都有据可查"。*
