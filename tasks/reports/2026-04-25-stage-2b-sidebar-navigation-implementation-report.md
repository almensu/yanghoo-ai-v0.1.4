# 阶段 2B 执行报告：侧边栏导航实施

执行日期：2026-04-25
执行者：Claude (glm)
分支：wt-0.2.0
报告路径：`tasks/reports/2026-04-25-stage-2b-sidebar-navigation-implementation-report.md`

## 审计依据

基于 `tasks/reports/2026-04-25-stage-2a-sidebar-navigation-audit.md` 审计结果实施。

## 修改文件列表

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `frontend/src/config/navigation.js` | 集中导航配置，2 分组 11 入口 |
| 修改 | `frontend/src/components/Sidebar.js` | 从配置渲染，支持分组和折叠 |
| 不改 | `frontend/src/App.js` | 路由不动 |

## 实施内容

### 新建 `frontend/src/config/navigation.js`

- `workspace` 分组：1 项（任务列表）
- `dev` 分组：10 项（全部测试页），默认折叠
- 每个入口字段：id、label、path、icon（lucide 组件）、group、priority、devOnly、hidden、description
- icon 使用 lucide-react 组件引用（非 JSX），每个入口独立图标

### 改造 `frontend/src/components/Sidebar.js`

- 移除硬编码 `menuItems` 数组（原 9 项含 1 个白屏入口 + 7 个测试页）
- 从 `navigationConfig` 按分组渲染
- 可折叠分组（dev）使用 localStorage 持久化展开/折叠状态
- 非折叠分组（workspace）仅展开时显示分组标题
- NavLink isActive 高亮逻辑不变
- 折叠状态下鼠标悬停显示 title 提示
- import 从 9 个 lucide icon 减为 3 个（ChevronLeft、ChevronRight、ChevronDown），其余从配置读取

### 已移除

- "文档列表" → `/docs`（App.js 无此路由，原侧边栏白屏）
- 7 个测试页从一级导航移入折叠的 dev 分组

### 已补充（原侧边栏缺失的 3 个路由）

- `/test/ass-subtitle` — ASS 字幕测试
- `/test/block-drag-to-project` — 拖拽到项目测试
- `/test/markdown-to-project` — Markdown 到项目测试

## 路由与菜单对应关系

| 菜单入口 | path | App.js 路由 | 分组 | 级别 |
|----------|------|------------|------|------|
| 任务列表 | `/` | 有 | workspace | 一级 |
| 开发测试（折叠组） | — | — | dev | 折叠 |
| ├ 视频播放器 | `/test/video-player` | 有 | dev | 隐藏 |
| ├ 字幕预览 | `/test/vtt-previewer` | 有 | dev | 隐藏 |
| ├ Markdown 查看器 | `/test/markdown` | 有 | dev | 隐藏 |
| ├ Markdown 列表 | `/test/markdownlist` | 有 | dev | 隐藏 |
| ├ YouTube 时间戳 | `/test/youtube-timestamp` | 有 | dev | 隐藏 |
| ├ ASS 字幕 | `/test/ass-subtitle` | 有 | dev | 隐藏 |
| ├ 关键帧剪辑 | `/test/keyframe-clip` | 有 | dev | 隐藏 |
| ├ 块编辑器 | `/test/block-editor` | 有 | dev | 隐藏 |
| ├ 拖拽到项目 | `/test/block-drag-to-project` | 有 | dev | 隐藏 |
| └ Markdown 到项目 | `/test/markdown-to-project` | 有 | dev | 隐藏 |

**不在导航中的路由（2 条）：**
- `/studio/:taskUuid` — 从任务列表导航进入
- `*` — 404 fallback（已注释）

**无路由的页面（6 个）：** SubtitleCutPage.jsx、TestPage_LayoutCoordination、TestPage_ProjectBubble、TestPage_ProjectSystem、TestPage_SrtParser、TestPage_StudioWorkSpace

## 正式导航 vs 开发测试

- 正式一级导航：1 项（任务列表）
- 开发测试分组：10 项，默认折叠
- 测试页零污染：workspace 组中无任何测试入口

## 验证结果

### 静态检查

- Sidebar.js 4 个 import 有效：react、react-router-dom、lucide-react（3 个）、config/navigation
- navigation.js 12 个 lucide icon 导入
- 全部 11 个 navigation path 在 App.js 中有对应路由 ✓
- workspace 组只有"任务列表"，无测试页污染 ✓
- App.js 未做任何修改 ✓

### 构建验证

- `frontend/node_modules` 不存在，未运行 `npm run build`
- 原因：任务约束不允许联网安装依赖

## git status

```
 M frontend/src/components/Sidebar.js
 M tasks/reports/2026-04-25-stage-1-clean-project-structure-report.md
?? frontend/src/config/navigation.js
?? tasks/2026-04-25-stage-2a-sidebar-navigation-audit.md
?? tasks/2026-04-25-stage-2b-sidebar-navigation-implementation.md
?? tasks/reports/2026-04-25-stage-2a-sidebar-navigation-audit.md
?? tasks/reports/2026-04-25-stage-2b-sidebar-navigation-implementation-report.md
```

2B 相关变更：
- `frontend/src/components/Sidebar.js`
- `frontend/src/config/navigation.js`
- `tasks/2026-04-25-stage-2b-sidebar-navigation-implementation.md`
- `tasks/reports/2026-04-25-stage-2b-sidebar-navigation-implementation-report.md`

阶段 1 / 2A 已存在的未提交项：
- `tasks/reports/2026-04-25-stage-1-clean-project-structure-report.md`
- `tasks/2026-04-25-stage-2a-sidebar-navigation-audit.md`
- `tasks/reports/2026-04-25-stage-2a-sidebar-navigation-audit.md`

## 本地产物清理

验收时发现以下 ignored `.DS_Store` 本地产物，已清理：

- `./.DS_Store`
- `backend/.DS_Store`
- `frontend/.DS_Store`
- `frontend/src/.DS_Store`
- `tasks/.DS_Store`

若 macOS 后续自动重建 `.DS_Store`，由 `.gitignore` 覆盖，不应纳入提交。

## 未处理风险

| 风险 | 说明 | 建议 |
|------|------|------|
| npm run build 未验证 | node_modules 不存在 | 安装依赖后验证 |
| lucide-react icon 兼容性 | FlaskConical、Captions、MousePointerClick、FileInput、Subtitles 可能在旧版本中不存在 | 安装依赖后验证，必要时替换为已有 icon |
| App.js TestPage import 残留 | 任务约束不删除路由 | 阶段 3 处理 |
| 无路由的 6 个页面 | 不在导航也不在路由中 | 阶段 3 决定保留或归档 |
| 前端 127.0.0.1:8000 硬编码 | App.js 中 API 地址未环境变量化 | 阶段 2C 或 3 处理 |

## 确认

没有 commit，没有 push。
