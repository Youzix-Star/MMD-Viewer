# 部署与使用

## 1. 启动本地服务

```bash
cd MMD-Viewer
python3 -m http.server 8000 --bind 0.0.0.0
```

打开 `http://localhost:8000`。

> [!WARNING]
> 不要用 `file://` 直接打开 HTML 文件，浏览器会拦截本地 XHR 请求，模型加载会失败。

## 2. 手机访问

手机和电脑连同一 Wi-Fi，浏览器访问：

```
http://<电脑局域网IP>:8000
```

| 系统 | 查看 IP |
| --- | --- |
| Windows | `ipconfig` → 无线局域网 IPv4 地址 |
| macOS | `ifconfig` → en0 的 inet 地址 |
| Linux | `ip addr` 或 `hostname -I` |

> [!TIP]
> 手机端体验更佳——触控操作、全屏沉浸、双指缩放都针对移动端优化。

## 3. 无缓存调试

Python 自带的 HTTP 服务器没有 `Cache-Control` 头，浏览器可能缓存旧版文件。修改代码后如果看不到效果：

- **方案 A**：浏览器强制刷新（iOS Safari 长按刷新按钮 → 请求桌面版本）
- **方案 B**：使用项目自带的无缓存服务器（如可用）

```
python3 .nocache.py
# 访问 http://localhost:8001
```

## 4. 常见问题

| 现象 | 排查 |
| --- | --- |
| 页面空白 / 模型不显示 | 检查控制台（F12）是否有 Ammo.js 加载失败；部分网络环境 CDN 访问受限 |
| 物理不动 / 裙子僵硬 | 确认浏览器支持 WebAssembly（2020 年后基本都支持） |
| 手机卡顿 | 试试 PHYS 面板降低帧率上限（fpsCap），或关闭物理 |
| 模型加载后变暗 | 通常是贴图路径问题，检查模型文件夹内贴图是否完整 |
| 切换模型后旧模型残留 | 刷新页面重载，这是已知的边界情况 |
