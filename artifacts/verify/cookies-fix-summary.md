# YouTube Cookies 问题修复总结

## ✅ 已完成的修改

### 1. 代码更新 (已应用)

以下文件已自动更新，添加了 cookies 支持：

| 文件 | 修改内容 |
|------|----------|
| `backend/src/tasks/ingest.py` | 创建任务时使用 cookies |
| `backend/src/tasks/download_media.py` | 下载视频时使用 cookies |
| `backend/src/tasks/download_youtueb_vtt.py` | 下载字幕时使用 cookies |
| `.gitignore` | 添加 cookies.txt 到忽略列表 |

### 2. 添加的功能

系统现在会自动按以下优先级查找 cookies 文件：
1. `backend/cookies.txt` (推荐)
2. `./cookies.txt` (项目根目录)
3. `~/.config/yt-dlp/cookies.txt`
4. `~/cookies.txt`

---

## 🔑 如何获取 Cookies

### 方法一：浏览器扩展（最简单）

1. **安装扩展**
   - Chrome: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox: [同一扩展](https://addons.mozilla.org/en-US/firefox/addon/get-cookiestxt-locally/)

2. **导出 Cookies**
   - 登录 YouTube
   - 打开任意视频页面
   - 点击扩展图标 → "Current Site" → "Export"
   - 下载 `cookies.txt`

3. **放置文件**
   ```bash
   cp ~/Downloads/cookies.txt backend/
   ```

### 方法二：命令行（临时）

```bash
# Chrome
yt-dlp --cookies-from-browser chrome "VIDEO_URL"

# Safari
yt-dlp --cookies-from-browser safari "VIDEO_URL"
```

---

## 🧪 验证修复

### 1. 重启后端服务
```bash
./stop.sh
./start.sh
```

### 2. 检查日志
```bash
tail -f backend.log | grep cookies
```

应该看到：
```
Using cookies file: /path/to/backend/cookies.txt
Using cookies file for authentication: /path/to/backend/cookies.txt
```

### 3. 测试下载
通过 UI 创建新的 YouTube 任务，应该能够成功下载。

---

## 📖 详细文档

完整指南请查看：
**`YOUTUBE_COOKIES_GUIDE.md`**

---

## ⚠️ 重要提醒

1. **不要分享 cookies.txt** - 它包含您的登录凭据
2. **定期更新** - Cookies 会过期（几周到几个月）
3. **已添加到 .gitignore** - cookies.txt 不会被提交到版本控制

---

## 🐛 如果还是报错

可能的原因：
1. Cookies 已过期 → 重新导出
2. Cookies 格式不正确 → 检查文件格式
3. 文件位置不对 → 确认在 `backend/` 目录

---

**更新日期**: 2026-01-13
**状态**: ✅ 代码已更新，只需添加 cookies.txt 文件
