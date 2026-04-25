# 阶段 2A 审计报告：侧边栏导航

审计日期：2026-04-25
审计者：Claude (glm)
模式：只读，未修改任何代码

---

## 审计范围

阅读了以下文件：

- `frontend/src/App.js` — 路由定义
- `frontend/src/components/Sidebar.js` — 侧边栏菜单
- `frontend/src/pages/` — 全部 18 个页面文件（浏览用途和头部）
- `frontend/src/components/` — 全部 38 个组件文件（浏览文件大小和导入关系）
- `frontend/src/utils/` — 全部 6 个工具文件

---

## 当前路由地图

App.js 共定义 12 条路由：

| # | URL path | 组件 | 动态参数 | 分类 | 应进入侧边栏 |
|---|----------|------|----------|------|-------------|
| 1 | `/` | TaskListPage | 无 | **核心功能** | 是（主入口） |
| 2 | `/studio/:taskUuid` | StudioPage | `:taskUuid` | **核心功能** | 否（从任务列表导航进入） |
| 3 | `/test/video-player` | TestPage_VideoPlayer | 无 | 测试/开发 | 隐藏 |
| 4 | `/test/vtt-previewer` | TestPage_VttPreviewer | 无 | 测试/开发 | 隐藏 |
| 5 | `/test/markdown` | TestPage_MarkdownViewer | 无 | 测试/开发 | 隐藏 |
| 6 | `/test/markdownlist` | TestPage_MarkdownList | 无 | 测试/开发 | 隐藏 |
| 7 | `/test/youtube-timestamp` | TestPage_YouTubeTimestamp | 无 | 测试/开发 | 隐藏 |
| 8 | `/test/ass-subtitle` | TestPage_AssSubtitle | 无 | 测试/开发 | 隐藏 |
| 9 | `/test/keyframe-clip` | TestPage_KeyframeClip | 无 | 测试/开发 | 隐藏 |
| 10 | `/test/block-editor` | TestPage_BlockEditor | 无 | 测试/开发 | 隐藏 |
| 11 | `/test/block-drag-to-project` | TestPage_BlockDragToProject | 无 | 测试/开发 | 隐藏 |
| 12 | `/test/markdown-to-project` | TestPage_MarkdownToProject | 无 | 测试/开发 | 隐藏 |

**无路由但存在页面的文件（6个：5 个 TestPage + 1 个普通页面）：**

| 文件 | 状态 |
|------|------|
| `SubtitleCutPage.jsx` | 无路由、无导入引用，疑似废弃 |
| `TestPage_LayoutCoordination.js` | 无路由，测试布局协调 hook |
| `TestPage_ProjectBubble.js` | 无路由，测试项目篮组件 |
| `TestPage_ProjectSystem.js` | 无路由，测试项目系统完整流程 |
| `TestPage_SrtParser.js` | 无路由，测试 SRT 解析 |
| `TestPage_StudioWorkSpace.js` | 无路由，测试工作区展开 |

---

## 当前侧边栏入口地图

Sidebar.js `menuItems` 共 9 项：

| # | 显示名称 | path | 对应功能 | 与路由一致 | 问题 |
|---|----------|------|----------|-----------|------|
| 1 | 视频列表 | `/` | TaskListPage | 是 | 正常，核心入口 |
| 2 | 文档列表 | `/docs` | **不存在** | **否** | 路由无 `/docs`，点击后白屏 |
| 3 | VideoPlayer 测试 | `/test/video-player` | TestPage_VideoPlayer | 是 | 测试页污染正式导航 |
| 4 | VTT Preview 测试 | `/test/vtt-previewer` | TestPage_VttPreviewer | 是 | 同上 |
| 5 | Markdown 测试 | `/test/markdown` | TestPage_MarkdownViewer | 是 | 同上 |
| 6 | Markdown List 测试 | `/test/markdownlist` | TestPage_MarkdownList | 是 | 同上 |
| 7 | YouTube 时间戳 测试 | `/test/youtube-timestamp` | TestPage_YouTubeTimestamp | 是 | 同上 |
| 8 | 关键帧剪辑 测试 | `/test/keyframe-clip` | TestPage_KeyframeClip | 是 | 同上 |
| 9 | 块编辑器 测试 | `/test/block-editor` | TestPage_BlockEditor | 是 | 同上 |

**侧边栏缺失的路由（3条）：**
- `/test/ass-subtitle` — 有路由但无侧边栏入口
- `/test/block-drag-to-project` — 有路由但无侧边栏入口
- `/test/markdown-to-project` — 有路由但无侧边栏入口

**侧边栏指向不存在的路由（1条）：**
- `文档列表` → `/docs` — App.js 无此路由，点击白屏

**Studio 入口被注释：**
- Sidebar.js 第 26 行 `{ name: 'Studio专区' }` 被注释掉，这是正确的，因为 Studio 应从任务列表进入

---

## 功能分层

### 高频核心功能（应一键直达）

| 功能 | 入口 | 说明 |
|------|------|------|
| 任务列表（导入/管理） | `/` → TaskListPage | 用户主入口：导入 URL、查看任务、进入 Studio |
| Studio（字幕/视频/文档/剪辑） | `/studio/:taskUuid` | 从任务列表点击进入，包含视频播放、字幕编辑、关键帧、AI 对话、项目篮 |

### 次级功能（需可发现但不挤一级入口）

| 功能 | 当前状态 | 说明 |
|------|----------|------|
| AI 对话 | Studio 内嵌（AIChat.js 72KB） | 不需要独立入口，但应被提及 |
| 项目篮/项目系统 | Studio 内嵌（ProjectBubble.js） | 不需要独立入口 |
| 跨任务文档浏览 | Studio 内嵌（CrossTaskBrowser.js） | 不需要独立入口 |

### 开发/测试入口（应隐藏）

| 页面 | 路由 | 实际用途 |
|------|------|----------|
| TestPage_VideoPlayer | `/test/video-player` | 硬编码 UUID 测试视频播放 |
| TestPage_VttPreviewer | `/test/vtt-previewer` | 硬编码 VTT 字幕预览 |
| TestPage_MarkdownViewer | `/test/markdown` | 硬编码 UUID 测试 markdown 渲染 |
| TestPage_MarkdownList | `/test/markdownlist` | Mock 数据测试 markdown 列表 |
| TestPage_YouTubeTimestamp | `/test/youtube-timestamp` | YouTube 嵌入 + 时间戳跳转测试 |
| TestPage_AssSubtitle | `/test/ass-subtitle` | ASS 字幕渲染测试 |
| TestPage_KeyframeClip | `/test/keyframe-clip` | 关键帧剪辑面板测试 |
| TestPage_BlockEditor | `/test/block-editor` | 块编辑器测试 |
| TestPage_BlockDragToProject | `/test/block-drag-to-project` | 拖拽到项目测试 |
| TestPage_MarkdownToProject | `/test/markdown-to-project` | markdown 到项目测试 |
| TestPage_LayoutCoordination | 无路由 | 布局协调 hook 测试 |
| TestPage_ProjectBubble | 无路由 | 项目篮组件测试 |
| TestPage_ProjectSystem | 无路由 | 项目系统完整流程测试 |
| TestPage_SrtParser | 无路由 | SRT 解析测试 |
| TestPage_StudioWorkSpace | 无路由 | 工作区展开测试 |

### 疑似废弃

| 文件 | 证据 |
|------|------|
| `SubtitleCutPage.jsx` | 无路由、无导入引用，用 useState 管理本地文件上传 |
| `VideoPlayer_fixed.js` | 仅 1 字节（空文件），无引用 |
| `PlaceholderComponent1.js` | StudioWorkSpace 内使用，但内容仅占位文字 |
| `PlaceholderComponent2.js` | 同上 |

---

## 问题诊断

### 1. 信息层级混乱

侧边栏 9 项中只有 1 项（视频列表）是真实功能入口，其余 7 项是测试页 + 1 项指向不存在的路由。用户打开侧边栏看到的 89% 是测试入口，核心功能被淹没。

### 2. 命名不一致

- "视频列表"用中文，但测试页用混合中英文（"VideoPlayer 测试"、"VTT Preview 测试"）
- 测试页后缀不统一：有的用"测试"，有的用"Test"
- 没有统一命名规范

### 3. 路由和菜单配置分散

- App.js 定义路由、Sidebar.js 硬编码菜单项，两者没有共享配置
- 存在"侧边栏有但路由无"（`/docs`）和"路由有但侧边栏无"（3 个 test 路由）的不一致
- 新增页面需要同时改两处，容易遗漏

### 4. 测试页污染正式导航

7 个测试页 + 1 个失效链接占据侧边栏 88% 空间。产品感完全被测试感压倒。

### 5. 核心工作流不可直达

用户无法通过侧边栏快速到达：
- 字幕编辑（只有进入 Studio 后才能操作）
- AI 对话（内嵌在 Studio）
- 项目管理（内嵌在 Studio）

这些是合理的（它们依赖任务上下文），但侧边栏应帮助用户理解产品能力范围。

### 6. 图标和视觉扫描效率低

- 多个测试页共用 `Settings` 图标（VideoPlayer 测试、Markdown 测试）
- 折叠状态下只有图标，无法区分功能
- 没有分组，所有入口平铺

---

## 推荐侧边栏结构

### 方案：2 组 + 1 折叠开发区

```
📦 工作台
  ├── 任务列表          /              ListTodo           一级入口，核心
  └── (Studio)          /studio/:id    —                  从任务列表导航，不入侧边栏

🔧 开发测试             默认折叠，仅开发环境展开
  ├── 视频播放器         /test/video-player     Play
  ├── 字幕预览           /test/vtt-previewer     Subtitles
  ├── Markdown 查看器    /test/markdown          FileText
  ├── Markdown 列表      /test/markdownlist      List
  ├── YouTube 时间戳     /test/youtube-timestamp Youtube
  ├── ASS 字幕           /test/ass-subtitle      Captions
  ├── 关键帧剪辑         /test/keyframe-clip     Camera
  ├── 块编辑器           /test/block-editor      Blocks
  ├── 拖拽到项目         /test/block-drag-to-project  MousePointerClick
  └── Markdown 到项目    /test/markdown-to-project    FileInput
```

### 完整入口定义

| 标题 | path | icon (lucide) | 分组 | 一级入口 | devOnly | 阶段 2B 实施 |
|------|------|---------------|------|---------|---------|-------------|
| 任务列表 | `/` | `ListTodo` | workspace | 是 | 否 | 是 |
| Studio | `/studio/:taskUuid` | — | — | 否 | — | 否（从任务列表导航） |
| 开发测试 | — | `FlaskConical` | dev | 折叠组头 | — | 是 |
| 视频播放器 | `/test/video-player` | `Play` | dev | 否 | 是 | 是 |
| 字幕预览 | `/test/vtt-previewer` | `Subtitles` | dev | 否 | 是 | 是 |
| Markdown 查看器 | `/test/markdown` | `FileText` | dev | 否 | 是 | 是 |
| Markdown 列表 | `/test/markdownlist` | `List` | dev | 否 | 是 | 是 |
| YouTube 时间戳 | `/test/youtube-timestamp` | `Youtube` | dev | 否 | 是 | 是 |
| ASS 字幕 | `/test/ass-subtitle` | `Captions` | dev | 否 | 是 | 是 |
| 关键帧剪辑 | `/test/keyframe-clip` | `Camera` | dev | 否 | 是 | 是 |
| 块编辑器 | `/test/block-editor` | `Blocks` | dev | 否 | 是 | 是 |
| 拖拽到项目 | `/test/block-drag-to-project` | `MousePointerClick` | dev | 否 | 是 | 是 |
| Markdown 到项目 | `/test/markdown-to-project` | `FileInput` | dev | 否 | 是 | 是 |

### 不纳入侧边栏的项

- `/docs` 路由不存在，移除侧边栏"文档列表"入口
- 无路由的 6 个页面文件（5 个 TestPage + `SubtitleCutPage.jsx`）保留在 pages/ 目录但不出现在任何导航

---

## 推荐代码架构

### 新增：`frontend/src/config/navigation.js`

```javascript
import {
  ListTodo, FlaskConical, Play, Subtitles, FileText,
  List, Youtube, Captions, Camera, Blocks,
  MousePointerClick, FileInput
} from 'lucide-react';

const navigationConfig = [
  {
    id: 'workspace',
    label: '工作台',
    items: [
      {
        id: 'task-list',
        label: '任务列表',
        path: '/',
        icon: ListTodo,
        group: 'workspace',
        priority: 1,
        devOnly: false,
        hidden: false,
        description: '导入媒体、管理任务、进入 Studio',
      },
    ],
  },
  {
    id: 'dev',
    label: '开发测试',
    icon: FlaskConical,
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'test-video-player', label: '视频播放器', path: '/test/video-player', icon: Play, group: 'dev', priority: 1, devOnly: true, hidden: false, description: 'VideoPlayer 组件测试' },
      { id: 'test-vtt-previewer', label: '字幕预览', path: '/test/vtt-previewer', icon: Subtitles, group: 'dev', priority: 2, devOnly: true, hidden: false, description: 'VTT 字幕预览测试' },
      { id: 'test-markdown', label: 'Markdown 查看器', path: '/test/markdown', icon: FileText, group: 'dev', priority: 3, devOnly: true, hidden: false, description: 'Markdown 渲染测试' },
      { id: 'test-markdownlist', label: 'Markdown 列表', path: '/test/markdownlist', icon: List, group: 'dev', priority: 4, devOnly: true, hidden: false, description: 'Markdown 列表测试' },
      { id: 'test-youtube-timestamp', label: 'YouTube 时间戳', path: '/test/youtube-timestamp', icon: Youtube, group: 'dev', priority: 5, devOnly: true, hidden: false, description: 'YouTube 嵌入+时间戳测试' },
      { id: 'test-ass-subtitle', label: 'ASS 字幕', path: '/test/ass-subtitle', icon: Captions, group: 'dev', priority: 6, devOnly: true, hidden: false, description: 'ASS 字幕渲染测试' },
      { id: 'test-keyframe-clip', label: '关键帧剪辑', path: '/test/keyframe-clip', icon: Camera, group: 'dev', priority: 7, devOnly: true, hidden: false, description: '关键帧剪辑面板测试' },
      { id: 'test-block-editor', label: '块编辑器', path: '/test/block-editor', icon: Blocks, group: 'dev', priority: 8, devOnly: true, hidden: false, description: '块编辑器测试' },
      { id: 'test-block-drag-to-project', label: '拖拽到项目', path: '/test/block-drag-to-project', icon: MousePointerClick, group: 'dev', priority: 9, devOnly: true, hidden: false, description: '块拖拽到项目篮测试' },
      { id: 'test-markdown-to-project', label: 'Markdown 到项目', path: '/test/markdown-to-project', icon: FileInput, group: 'dev', priority: 10, devOnly: true, hidden: false, description: 'Markdown 到项目篮测试' },
    ],
  },
];

export default navigationConfig;
```

### 改造：`Sidebar.js`

- 导入 `navigationConfig`
- 按分组渲染，每组有标题
- dev 组默认折叠，点击展开
- 从配置读取 icon 组件（不再硬编码 JSX）
- 支持折叠状态下显示分组图标

### 不改：`App.js`

- 当前路由不动
- 不删除任何 TestPage 路由（避免 CRA build 失败）

---

## 阶段 2B 实施计划

```
Step 1 - 新增导航配置
  新建 frontend/src/config/navigation.js
  预计文件：1 新建
  风险：无，纯新增
  验收：文件存在，导出正确

Step 2 - 改 Sidebar 从配置渲染
  重写 Sidebar.js menuItems 为从 navigationConfig 渲染
  支持分组标题和折叠
  移除硬编码的 menuItems 数组
  移除指向不存在的 /docs 的入口
  预计文件：1 修改（Sidebar.js）+ 1 新建（navigation.js）
  风险：低，只是渲染方式变化，不影响路由
  验收：侧边栏只显示"任务列表"一级入口 + 折叠"开发测试"组

Step 3 - 归类/隐藏测试入口
  测试页全部归入 dev 分组
  devOnly: true 的入口默认折叠
  未来可通过环境变量完全隐藏
  预计文件：0（已在 Step 1 配置中完成）
  风险：无
  验收：默认视图只有 1-2 个核心入口

Step 4 - 调整视觉层级和快速入口
  分组标题显示
  折叠/展开动画
  图标统一（每个入口用不同 lucide icon）
  预计文件：可能修改 App.css 或 Sidebar 相关样式
  风险：低，纯视觉
  验收：视觉清爽，折叠状态下图标可识别

Step 5 - 验证路由和构建
  确认所有原有路由仍可访问
  确认从任务列表到 Studio 的导航不受影响
  如果 node_modules 存在则运行 npm run build
  预计文件：0
  风险：无
  验收：无回归
```

---

## 风险和不动项

### 本阶段不动

| 项 | 原因 |
|----|------|
| App.js 路由定义 | 不删除任何 TestPage 路由 |
| TestPage_\*.js 文件位置 | 不移动，避免 import 路径变化 |
| Studio 入口 | 保持从任务列表导航进入，不入侧边栏 |
| `/docs` 路由 | 不新增，只从侧边栏移除失效入口 |

### 阶段 2B 风险

| 风险 | 缓解 |
|------|------|
| Sidebar 重构引入 bug | 保留 NavLink isActive 逻辑不变 |
| 折叠状态丢失 | 使用 localStorage 持久化（已有先例） |
| lucide-react 缺少部分 icon | 用已有 icon 替代，不安装新包 |
| CRA build 失败 | 不删除 import 和路由，只隐藏入口 |

### 遗留到后续阶段

- `SubtitleCutPage.jsx` 疑似废弃，阶段 2B 不动，阶段 3 清理
- `VideoPlayer_fixed.js` 空文件，阶段 3 清理
- `PlaceholderComponent1/2.js` 被 StudioWorkSpace 引用，阶段 3 确认后处理
- 无路由的 6 个页面文件（5 个 TestPage + `SubtitleCutPage.jsx`），阶段 3 决定保留或归档
- 前端 `127.0.0.1:8000` 硬编码，阶段 2C 或 3 处理

---

## 给主控的验收提示

主控验收本审计报告时，建议独立确认：

1. 阅读 `App.js` 确认路由数量为 12 条（2 核心功能 + 10 测试页）
2. 阅读 `Sidebar.js` 确认 menuItems 为 9 项，其中 `文档列表` 指向不存在的 `/docs`
3. 确认侧边栏测试页占比 7/9（78%）
4. 确认 3 条有路由无侧边栏入口（ass-subtitle、block-drag-to-project、markdown-to-project）
5. 确认 6 个无路由页面，其中 5 个 TestPage（LayoutCoordination、ProjectBubble、ProjectSystem、SrtParser、StudioWorkSpace）+ `SubtitleCutPage.jsx`
6. 判断阶段 2B 是否可以按推荐方案开始

---

## 阅读文件清单

- `frontend/src/App.js`
- `frontend/src/components/Sidebar.js`
- `frontend/src/pages/TaskListPage.js`（前 30 行）
- `frontend/src/pages/StudioPage.js`
- `frontend/src/pages/SubtitleCutPage.jsx`（前 30 行）
- `frontend/src/pages/TestPage_*.js`（全部 15 个文件前 15 行；10 个有路由，5 个无路由）
- `frontend/src/components/` 全部文件列表
- `frontend/src/utils/` 全部文件列表
- `frontend/src/components/PlaceholderComponent1.js`
- `frontend/src/components/VideoPlayer_fixed.js`

**未修改任何代码，未 commit，未 push。**
