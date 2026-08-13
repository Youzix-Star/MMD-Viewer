# 已知问题清单

> 行号基于当前 `index.html`（833 行，浅色 Material 主题版）
> 状态：✅ 已解决 ／ 🟢 未修（轻微）／ ⏸ 待办

## ✅ 已解决（累计）

- **拆分**：模型/纹理移出 HTML（9.2MB → 22KB + White.pmx + 10 贴图），相对路径加载
- **P1-1** 死代码：filepick/fileinput 清除
- **P1-2** 角度环绕：差值 wrap [-π, π]，离心力不再反向爆冲
- **P1-3** CDN 静默崩溃：Ammo try/catch + 全局 error 红色错误条
- **P1-4** 内存泄漏：`_gVec`/`_cfForce` 单例复用
- **P2-3** 暗角 z-index：浅色主题已移除 vignette
- **P2-5** 假日志：真实回调驱动（Material 图标）
- **P3-5** 贴图 colorSpace：角色偏暗修复
- **kill-ai-slop**：扫描线/表面渐变移除；Material 改版（白色主题、Noto Sans SC、Material Icons、Material 2 滑块）
- **发尾抽搐**：离心力按质量归一 + lerp 平滑 + 上限 30
- **呆毛/裙摆抖动（遗留）**：阻尼 0.3/0.5 + 摇摆幅度 0.015 + maxStepNum 5 + 默认参数调校（重力 -30、弹簧 200）——用户验证"有所缓解，暂时这样"
- **file:// 跨域**：改 HTTP 部署

## 🟡 P2 · 中等（未修）

- ~~**P2-1** 裙摆识别只匹配日文 `スカート`~~ ✅ 已修复 2026-08-13：兼容日文全/半角 + 英文（`skirt`）
- ~~**P2-2** 空 catch / 仅 console.error~~ ✅ 已修复 2026-08-13：约束失败 console.warn + 页面提示一次；dispose 失败 console.warn。⚠ 修复后暴露遗留 bug：`setLimit is not a function`（非弹簧类约束）——已补充修复：方法存在性检查，非 6DofSpring 约束跳过

## 🟢 P3 · 轻微 / 观察项（未修）

- ~~**P3-1** 装饰环横穿模型身体~~ ✅ 已关闭 2026-08-13：原设计刻意保留（原位横穿），恢复 ring 定义/缩放/动画
- ~~**P3-2** resize 未防抖、未同步 pixelRatio~~ ✅ 已修复 2026-08-13：rAF 防抖 + `setPixelRatio` 同步
- ~~**P3-3** 待机摇摆与物理骨骼驱动顺序敏感~~ ✅ 已修复 2026-08-13：摇摆移到 `physics.update` 之后设置（不再被 `_updateBones` 回写覆盖，消除抖动源）
- ~~**P3-4** 模型加载后相机 min/maxDistance 突变导致变焦~~ ✅ 已修复 2026-08-13：边界包含当前相机距离
- ~~**P3-6** 首帧 FPS 统计含初始化时间~~ ✅ 已修复 2026-08-13：计时起点改为第一帧（`lastT=0` 哨兵）

## ⏸ 待办 / 回退中

### T-1 模型选择加载（重新接入中，待验证）
- 已回退原因：上次 `fetch + loader.parse` 自定义链路不可靠（纹理路径/异常不透明）
- 重新实现（2026-08-13）：**直接走 `MMDLoader.load`**（与白模同一验证路径，`extractUrlBase` 自动解析纹理目录，中文路径浏览器自动编码）
  - PHYS 头部 `MODELS` 按钮 → 右上模型列表面板（manifest.json 驱动，当前项高亮）
  - 默认加载 White；manifest 失败 fallback 白模；错误走日志 + 全局错误条（P1-3 已就绪）
- 待验证项（部署后）：
  1. ✅ 冰饭式普通版可加载
  2. 多物理马尾版能否加载（骨骼多，手机性能）
  3. ✅ 中文路径纹理正常
  4. 切换时旧模型/物理清理是否正常
- 新问题（已处理 2026-08-13）：额头两撮毛坠入地底（约束失效刚体自由下坠）→ 曾加 `guardFallingBodies()` 兜底，**已按用户要求回退**（等观察）
- 新增模型：Kasane Teto SynthV（`models/Kasane Teto SynthV/`，SV + SV_TEX 两个 PMX；Tex 文件名已按 PMX 引用改首字母大写，26 项路径核对一致）

### T-2 待办想法（未做）
- 物理驱动方案：彻底消除"手动 rotation 与物理骨骼回写冲突"（若抖动复发）
- 冰饭式模型接入：等 T-1 排查完成后启用 models/ 目录
