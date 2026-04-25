# 阶段 3K-B 执行报告：中风险 React hooks warning 修复

执行日期：2026-04-25
执行者：Claude (glm)

## 执行前 git status

- `git status`: 干净（仅 3K-B 任务文件 untracked）
- `git log -3`: `903829d` docs: 3K-A 返工报告, `58d9326` fix: 3K-A 返工修复, `c90ce16` docs: 3K-A 报告

## 基线 build warning 数量

8 条 `react-hooks/exhaustive-deps`，无 `no-unused-vars`，无 `no-use-before-define`。

## 修改文件列表

| 文件 | 修改类型 |
|------|---------|
| `frontend/src/components/Studio.js` | optimizeSubtitleTiming 补齐依赖 + 移到 effect 前；taskDetails.ass_files 补齐依赖 |
| `frontend/src/components/VideoPlayer.js` | initializeYouTubePlayer 包进 useCallback，移到两个 effect 前，两个 effect 补齐依赖 |

## 每条 warning 的修复方式

### #6 Studio.js:1256 — optimizeSubtitleTiming

**修法**: `optimizeSubtitleTiming` 已是 `useCallback`（依赖 `[subtitleOptimization]`），直接将其加入 effect dep array。为避免 `no-use-before-define`，将 useCallback 定义从 effect 后（line 1258-1332）移到 effect 前。

**行为等价**: 函数体和依赖不变。effect 原已包含 `subtitleOptimization`，加入 `optimizeSubtitleTiming`（引用稳定）不会导致额外重执行。

### #7 Studio.js:1653 — taskDetails.ass_files

**修法**: 在 useCallback 的 dep array 末尾加入 `taskDetails?.ass_files`。使用可选链确保 taskDetails 为 null/undefined 时不报错。

**行为等价**: ass_files 变化时 callback 更新，使用最新值。当前代码已使用 `taskDetails?.ass_files` 安全访问模式。

### #10/#11 VideoPlayer.js:1136/1204 — initializeYouTubePlayer

**修法**: 将 `initializeYouTubePlayer` 包进 `useCallback(() => { ... }, [])`。空依赖数组因为函数内只读取：
- `window.YT` / `window.YT.Player` — 全局变量，非响应式
- `document.getElementById` — DOM API，非响应式
- `extractYouTubeVideoId` — `VideoPlayer` 组件内定义的本地 helper；函数体不读取 props/state，行为纯
- `youtubePlayerRef.current` — ref，非响应式

将 useCallback 定义移到两个 effect 之前（避免 `no-use-before-define`），并在两个 effect 的 dep array 中加入 `initializeYouTubePlayer`。

**行为等价**: useCallback 空依赖 → 引用永远稳定 → effect 不会额外重执行。播放器初始化逻辑完全不变。

## initializeYouTubePlayer 依赖分析

| 读取项 | 类型 | 是否响应式 | 是否需要加入 dep |
|--------|------|-----------|-----------------|
| `window.YT` | 全局变量 | 否 | 否 |
| `window.YT.Player` | 全局变量 | 否 | 否 |
| `document.getElementById` | DOM API | 否 | 否 |
| `extractYouTubeVideoId` | 组件内本地 helper；函数体不读取 props/state | 否 | 否 |
| `youtubePlayerRef.current` | ref.current | 否（mutable） | 否 |

结论：`extractYouTubeVideoId` 不是模块级函数，而是 `VideoPlayer` 组件内的本地 helper。由于其函数体不读取 props/state 且行为纯，当前 `initializeYouTubePlayer` 使用 `useCallback([])` 在构建上可接受，引用永久稳定。

## build 结果

**`npm run build` 成功。**

master 复核 `cd frontend && npm run build` 成功，确认剩余 hooks warning 为 4 条，无新增 `no-use-before-define` / `no-unused-vars`，`git diff --check` 通过。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| 3K-B 4 条 warning 全部消除 | pass |
| 剩余 hooks warning = 4 | pass |
| 不新增 no-unused-vars | pass |
| 不新增 no-use-before-define | pass |
| 不新增其他 eslint warning | pass |

## 剩余 warning 列表

| # | 文件 | 行号 | Warning | 归属 |
|---|------|------|---------|------|
| 1 | MarkdownWithTimestamps.js | 376 | handleTimestampClick / placeholderMapRef.current | 3K-C |
| 2 | Studio.js | 1171 | displayLang | P2 暂缓 |
| 3 | StudioWorkSpace.js | 212 | markdownContent / selectedFile | 3K-C |
| 4 | VttPreviewer.js | 178 | videoRef.current | P3 |

## 是否新增 warning

否。8 条 → 4 条，减少的 4 条全部是 3K-B 目标。

## 浏览器/手动回归结果

**未执行浏览器验证。**

原因：当前环境无运行中的 dev server 和浏览器访问能力。以下为建议回归清单：

1. 打开包含本地视频的 Studio 页面 → 确认本地视频正常渲染
2. 打开包含 YouTube/embed URL 的 Studio 页面 → 确认 YT 播放器初始化无报错
3. 切换视频来源 → 确认不会重复创建播放器实例
4. 切换字幕语言 → 确认字幕优化（短句合并）仍然生效
5. 执行剪辑操作 → 确认 ass_files 路径正确传递

## 是否触碰 3K-B 范围外代码

否。仅修改了目标函数/hooks 依赖数组/定义位置。

## 最终 git status

```
 M frontend/src/components/Studio.js
 M frontend/src/components/VideoPlayer.js
?? tasks/2026-04-25-stage-3k-b-medium-risk-hooks-fixes.md
?? tasks/reports/2026-04-25-stage-3k-b-medium-risk-hooks-fixes.md
```

## 本地产物清理

已清理以下 ignored 本地产物：

- `tasks/.DS_Store`
- `backend/src/__pycache__/`
- `backend/src/routes/__pycache__/`
- `backend/src/tasks/__pycache__/`
- `backend/src/utils/__pycache__/`

## 提交/推送状态

本次返工未改前端代码，未 commit，未 push。
