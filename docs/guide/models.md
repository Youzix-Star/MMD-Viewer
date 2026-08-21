# 模型说明

## 内置模型

| 模型 | 文件 | 说明 |
| --- | --- | --- |
| Kasane Teto SynthV | `Kasane Teto SV.pmx` | 重音泰托 SynthV 版，推荐用于舞蹈 |
| Kasane Teto SynthV · TEX | `Kasane Teto SV_TEX.pmx` | 独立贴图版，纹理更精细 |
| Sour 式初音ミク（White） | `White.pmx` | 默认加载模型，物理效果最完整 |
| Sour 式初音ミク（Black） | `Black.pmx` | 同款黑色配色 |

> [!NOTE]
> 模型归原作者所有。Sour 式允许改造与二次配布（保持风格、附 readme）；禁止商用、R18。
> Kasane Teto 须遵守 [TWINDRILL](https://kasaneteto.jp/) 与 AH-Software 角色条款。

## 添加新模型

1. 解压模型包，将整个文件夹放入 `models/`
2. 在 `manifest.json` 的 `models` 数组加一条：

```json
{
  "id": "my-model",
  "name": "显示名",
  "file": "models/我的模型/模型.pmx",
  "note": ""
}
```

3. 刷新页面，点 PHYS 面板的 `MODELS` 按钮选择

> [!WARNING]
> 模型纹理文件名大小写需与 PMX 内部引用一致（Linux 区分大小写）。
> 如果模型加载后纹理丢失（全白/全黑），大概率是文件名大小写问题。

## 本地导入（临时加载）

MODELS 面板右上 **「📂 导入」** → 弹窗**选择 PMX 文件 + 纹理文件夹** → 确认：

- **临时加载**：不写入项目、不落服务器，刷新页面后消失
- 纹理通过 `webkitdirectory` 选择整个文件夹
- 支持手机端（Android Chrome 测试通过）

> [!TIP]
> 导入的模型可以配合内置动作使用，前提是模型带相应骨骼（如肩P/腕捩/足D）。

## 模型兼容性

| 模型 | 物理 | 裙子松绑 | 风力 | 舞蹈兼容 |
| --- | --- | --- | --- | --- |
| Teto SV | ✅ | ✅ | ✅ | numb numb ✅ · IRIS OUT ⚠️ 缺肩P/足D |
| Sour White | ✅ | ✅ | ✅ | numb numb ✅ · IRIS OUT ✅ |
| Sour Black | ✅ | ✅ | ✅ | numb numb ✅ · IRIS OUT ✅ |

## 目录结构

```
MMD-Viewer/
├── index.html        # 主应用（依赖 vendor/ 与 manifest.json）
├── manifest.json     # 模型清单
├── CHANGE.md         # 变更记录
├── LICENSE           # AGPLv3
├── PHYSICS.md        # 物理方案与参数说明
├── vendor/           # 本地化 three 模块（MMDLoader 等）+ fonts/
├── source/           # 源项目（陌袹陌提供）
│   └── console-white-mmd.html
└── models/           # 模型包（.pmx + 贴图）
    ├── Kasane Teto SynthV/
    ├── Sour式初音ミク/
    ├── numb_numb/     # numb numb 舞蹈动作
    └── IRIS_OUT/      # IRIS OUT 舞蹈动作
```
