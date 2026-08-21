# 动作播放

## 内置舞蹈

MODELS 面板「动作」区可播放 VMD 动作（模型加载后）：

| 动作 | 来源 | 借物表标注（条款要求） | 兼容模型 |
| --- | --- | --- | --- |
| **numb numb** | Aileen_71 配布版 | 振付：まりやん · 动作：Aileen_71 | 通用（推荐 Teto） |
| **IRIS OUT** | Pronxy_迫奈熏 | 动作：Pronxy_迫奈熏 | ⚠️ 需肩P/腕捩/足D —— White/Black 完整发挥，Teto 可能不完整 |

> [!CAUTION]
> **BGM**（NumbNumb.wav / IRIS OUT.wav）：音乐版权归原唱片公司，不入库、勿公开分发。
> 本地放置于对应 `models/` 目录后自动播放。

### 条款说明

- Aileen_71：禁 18+、禁收费转售、禁有偿委托
- Pronxy_迫奈熏：禁商用/R18（允许免费二次配布与游戏/程序使用）
- 使用前请遵守各作者条款

## 导入自己的动作

MODELS 动作区右上 **「📂 导入」** → 弹窗**分别选择**：

| 文件类型 | 格式 | 说明 |
| --- | --- | --- |
| 动作 | `.vmd` | 骨骼动画，自动识别含相机帧的动作 |
| 镜头 | `.vmd` | 相机动画（从动作 VMD 中分离） |
| 音乐 | 音频文件 | 配乐，随动作播放 |

- 三个可**全选**（舞蹈 + 运镜 + 配乐同时生效）或只选其一
- VMD 自动识别：含相机帧的动作文件会同时解析为动作 + 镜头
- **临时加载**：不写入项目、不落服务器（音乐走浏览器本地 blob），刷新页面后消失
- 内置动作之外，任何 VMD 都可这样临时播放

> [!WARNING]
> **条款自负**：自行导入的动作/音乐，配布条款与借物表由使用者自行确认。
> 动作需要模型带相应辅助骨骼（如肩P/腕捩/足D）才能完整发挥。

## 动作控制

播放时底部出现控制条：

| 控件 | 功能 |
| --- | --- |
| 进度条 | 拖动跳转到指定时间（seek） |
| 播放/暂停 | 控制动画播放状态 |
| 倍速 | 0.5x / 1x / 1.5x / 2x |
| 快进 | 跳到下一个关键帧 |

> [!TIP]
> Seek 时 BGM 和物理会同步暂停，松手后恢复播放并自动 warmup，避免穿模。

## 动作播放技术细节

<details>
<summary>点击展开（开发者阅读）</summary>

### 架构

- `MMDAnimationHelper({sync: false})` + `add(mesh, {animation: clip, physics: false})`
- **双物理隔离**：helper 不创建自己的 MMDPhysics，物理由项目手动接管
- 每帧顺序：`helper.update(dt)` → `updateMatrixWorld(true)` → `physics.update(dt)`

### 与 MMD 官方一致

- 动作只播一次（`LoopOnce` + `clampWhenFinished`）
- 播完延迟一帧自动停止（BGM 同步停）
- 播放前 `resetPose()`（骨骼 pose + morph 清零 + 物理重贴）避免末帧残留

</details>
