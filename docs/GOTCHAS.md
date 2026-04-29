# 避坑指南 (Gotchas)

本文档记录在 Yanghoo AI 开发过程中发现的非直观问题、环境陷阱及解决方案。

## 媒体处理 (Media Processing)

### 1. yt-dlp 格式选择与合并
- **问题**: 使用 `yt-dlp -f "best"` 往往只会下载单一流（通常是已合并的低质量流），或者在某些平台（如 X/Twitter）上下载到没有音频的视频。
- **坑**: `-f "best"` 并不等于“最佳音画质量”。
- **避坑**: 不指定 `-f` 或使用 `--merge-output-format mp4` 让 `yt-dlp` 自动下载最佳视频流和最佳音频流并进行合并。

### 2. ffmpeg 提取音频失败
- **问题**: 对没有音频流的视频执行 `ffmpeg -vn -acodec pcm_s16le ...` 会直接报错导致进程崩溃。
- **坑**: 并非所有下载的视频都包含音频（如静音视频、GIF转视频）。
- **避坑**: 在执行 `ffmpeg` 提取之前，先使用 `ffprobe` 检查是否存在音频流：
  ```bash
  ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "input.mp4"
  ```
  如果输出为空，则说明无音频。

### 3. MLX Audio 环境依赖
- **问题**: `mlx-audio` 依赖特定的 Python 环境 and `MLX_AUDIO_PYTHON` 环境变量。
- **坑**: Node.js 的 `execSync` 默认可能找不到对应的 Python 虚拟环境。
- **避坑**: 在启动或调用脚本前，显式检查 `python -c "import mlx_audio"`。

### 4. 无音轨视频的状态管理 (State Management for Silent Videos)
- **问题**: 虽然通过 `ffprobe` 解决了 `ffmpeg` 崩溃问题，但如果仅在执行提取时报错，UI 仍会持续引导用户点击“视频转字幕”，导致无效操作循环。
- **坑**: 仅靠临时报错无法阻止 UI 的错误引导，必须将“无音轨”作为一种持久化的媒体属性。
- **避坑**: 
  - 在 `MediaAsset` 领域模型中增加 `hasAudio` 和 `notTranscribableReason` 字段。
  - 在下载完成后的探测阶段（Probing）即记录音轨状态。
  - UI 需根据 `hasAudio: false` 显式禁用转写按钮并展示原因，而非等待后台报错。

## 工程与开发环境 (Dev Environment)

### 0. 服务启动顺序与 MLX 环境变量
- **问题**: 浏览器报 `ERR_CONNECTION_REFUSED`，或者点击“音频转字幕/视频转字幕”时报 `MLX_AUDIO_PYTHON is not configured`。
- **坑**:
  - `127.0.0.1:3000` 拒绝连接通常是 Vite 前端没启动。
  - `127.0.0.1:8001` 可访问不代表 MLX 可用；API 进程可能是旧终端启动的，没有带 `MLX_AUDIO_PYTHON`。
  - 修改环境变量后，已运行的 API 进程不会自动继承新变量，必须重启 API。
- **避坑**:
  1. 先检查端口：
     ```bash
     lsof -nP -iTCP:3000 -sTCP:LISTEN || true
     lsof -nP -iTCP:8001 -sTCP:LISTEN || true
     ```
  2. 检查 API 进程是否带 MLX 环境变量：
     ```bash
     ps eww -p <api-pid> | tr ' ' '\n' | rg '^MLX_AUDIO_PYTHON=' || true
     ```
  3. 用正确环境变量启动 API：
     ```bash
     MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev -w @yanghoo/api
     ```
  4. 单独启动前端：
     ```bash
     npm run dev -w apps/web
     ```
  5. 验证代理链路：
     ```bash
     curl -sS http://127.0.0.1:8001/api/health
     curl -sS http://127.0.0.1:3000/api/health
     ```

### 0.1 workspace cwd 与仓库根脚本路径
- **问题**: API 报错找不到 MLX 脚本，例如：
  ```text
  can't open file '.../apps/api/scripts/transcript/run-mlx-audio-transcription.py'
  ```
- **坑**: 通过 `npm run dev -w @yanghoo/api` 启动时，API 进程的 `process.cwd()` 可能是 `apps/api`，不是仓库根目录。不能用 `path.resolve(process.cwd(), 'scripts/...')` 来定位仓库根脚本。
- **避坑**:
  - 仓库脚本只保留一份在根目录 `scripts/`，不要复制到 `apps/api/scripts/`。
  - 生产代码应通过 `import.meta.url` 或向上查找根 `package.json`（带有 `workspaces` 字段）来定位仓库根。
  - 调用 Python 前先 `fs.existsSync(scriptPath)`，若缺失则抛出带有 `process.cwd()`、`Resolved Root` 和 `scriptPath` 的详尽诊断信息。
  - 推荐使用统一的 `resolveRootScript` 助手函数。

### 0.2 taskId 作为 URL path 参数必须 encode
- **问题**: 删除卡片或删除资产时报 404，例如请求实际变成：
  ```text
  DELETE /api/tasks/xhs-682eefa40000000003039a4b?source=webshare&...
  ```
  后端只收到 `xhs-682eefa40000000003039a4b`，找不到旧记录。
- **坑**: 历史脏数据可能把小红书 query string 写进 `source.id`。如果前端直接拼：
  ```ts
  `/api/tasks/${taskId}`
  ```
  浏览器会把 `?` 后面当成 query string，而不是 path 的一部分。
- **避坑**:
  - 所有 task-specific API URL 都必须使用 `encodeURIComponent(taskId)`。
  - 新的小红书导入必须使用 canonical ID，不能让 `?source=...` 进入 `source.id`。
  - 旧脏 ID 仍要能通过 encoded route 删除，不能要求用户手动清理 data 目录。

### 0.3 小红书封面防盗链 (Xiaohongshu Cover Hotlinking)
- **问题**: `xhscdn.com` 的封面图在浏览器直接访问经常报 403 或加载失败。
- **坑**: 小红书 CDN 有防盗链限制或 URL 签名过期快。
- **避坑**: 
  - 导入时通过 `cacheThumbnailUseCase` 将远程封面缓存到本地 `data/sources/{sourceId}/thumbnail.{ext}`。
  - `source.thumbnailUrl` 应设为本地 API 路径 `/api/tasks/{sourceId}/thumbnail`。
  - 前端 `TaskCard` 必须实现 `onError` 降级逻辑，在图片加载失败时展示占位图。

### 1. npm workspaces 启动阻塞
- **问题**: 在根目录执行 `npm run dev -ws` 会按顺序启动所有 workspace。
- **坑**: 如果第一个 workspace 是 Fastify 这种持久运行的服务，它会阻塞后续 workspace（如 Vite 前端）的启动。
- **避坑**: 使用并发执行工具或手动开启多个终端：
  ```bash
  npm run dev -w @yanghoo/api & npm run dev -w @yanghoo/web &
  ```

### 2. X/Twitter 抓取限制
- **问题**: `yt-dlp` 在不提供 Cookies 的情况下抓取 X/Twitter 视频经常失败。
- **坑**: X 增加了大量的反爬限制，经常返回 `No video could be found`。
- **避坑**: 在后台 `media-manifest.json` 中记录完整的 `stderr` 输出，以便在 UI 上给用户明确的“需配置 Cookies”提示。

## 前端组件 (Frontend)

### 1. Lucide 图标动态渲染
- **问题**: 直接在 JSX 中使用 `primaryAction.icon` 这种动态赋值的组件名可能导致渲染异常或由于大小写规范被误判。
- **坑**: `<primaryAction.icon ... />` 这种写法在某些编译器环境下可能不稳定。
- **避坑**: 采用局部变量大写化的方案：
  ```tsx
  const Icon = primaryAction.icon;
  return <Icon className="..." />;
  ```
