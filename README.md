# MMD Viewer

移动端 MMD/PMX 模型查看器。Material Design 浅色主题，支持多模型切换与实时物理模拟。基于 Three.js + Ammo.js。

> **物理系统**：three 官方 MMDPhysics + 参数调校（配件微重力 / 裙摆袖口约束松绑 / 微风）。实现与调参说明见 [`PHYSICS.md`](PHYSICS.md)。

## 快速开始

```bash
cd MMD-Viewer
python3 -m http.server 8000 --bind 0.0.0.0
```

打开 `http://localhost:8000`。手机连同一 Wi-Fi，访问 `http://<电脑局域网IP>:8000`（Windows 用 `ipconfig`、macOS 用 `ifconfig` 查看 IP）。

> 不要用 `file://` 直接打开，浏览器会拦截本地 XHR。

## 添加模型

1. 解压模型包，将整个文件夹放入 `models/`
2. 在 `manifest.json` 的 `models` 数组加一条：

```json
{ "id": "my-model", "name": "显示名", "file": "models/我的模型/模型.pmx", "note": "" }
```

3. 刷新页面，点 PHYS 面板的 `MODELS` 按钮选择

> 模型纹理文件名大小写需与 PMX 内部引用一致（Linux 区分大小写）。

## 目录结构

```
MMD-Viewer/
├── index.html        # 主应用（2026-08-13 拆分后已非单文件，依赖 vendor/ 与 manifest.json）
├── manifest.json     # 模型清单
├── CHANGE.md         # 变更记录
├── LICENSE           # AGPLv3
├── PHYSICS.md        # 物理方案与参数说明
├── vendor/           # 本地化 three 模块（MMDLoader 等）+ fonts/（Material Icons 自托管）
├── source/           # 源项目（陌袹陌提供）
│   └── console-white-mmd.html
└── models/           # 模型包（.pmx + 贴图）
    ├── Kasane Teto SynthV/
    ├── Sour式初音ミク/
    └── numb_numb/     # numb numb 舞蹈动作（入库）+ BGM（不入库，本地自备）
```

## 动作资源与借物表

MODELS 面板「动作」区可播放 VMD 动作（模型加载后）：

| 动作 | 来源 | 借物表标注（条款要求） |
|------|------|------------------------|
| **numb numb**（舞蹈，含 BGM 联动） | Aileen_71 配布版 | **振付：まりやん · 动作：Aileen_71**（硬性要求，发布须标注） |

- **BGM**（NumbNumb.wav）：音乐版权归原唱片公司，**不入库、勿公开分发**，本地放置于 `models/numb_numb/` 后自动播放
- 动作条款：Aileen_71 动作禁 18+、禁收费转售、禁有偿委托——使用前请遵守
- 曾接入的美丽Liya 动作包（眨眼/瞳孔/表情/镜头）因条款含"禁手机mmd/禁二传"**已全删**（2026-08-15，见 CHANGE.md）
```

## 模型版权

内置模型归原作者所有，使用与分发请遵循各模型 `readme.txt`：

- **Sour式初音ミク**（Sour暄）：允许改造与二次配布（保持 Sour 式风格、附 readme）；禁止商用、R18/政治/宗教等
- **Kasane Teto SynthV**：允许自由使用，须遵守 TWINDRILL 与 AH-Software 角色条款

### 开源协议

本项目基于 **GNU Affero General Public License v3.0**（AGPLv3）开源。

---

## 更新日志

见 [CHANGE.md](CHANGE.md)（含项目演进史、物理 v1→v2→v2.5→v3 完整记录）

> [!CAUTION]
> 本项目无一行人工代码，自行审查代码安全性


## 特别鸣谢

感谢 **陌袹陌** 开创项目，本项目是基于[源项目](source/console-white-mmd.html)修改而来

---

**如果对你有帮助，欢迎 ⭐ Star！**
(´▽`)