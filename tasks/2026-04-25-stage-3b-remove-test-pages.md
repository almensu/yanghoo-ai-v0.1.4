# 阶段 3B：移除前端测试页面

你是 glm。用户明确决定：测试页面不需要保留，简单粗暴都去掉。

阶段 3B 不再执行“低风险 warning 修复”方案，改为移除前端测试页面、测试路由和测试导航入口。

## 目标

从正式前端中移除所有测试页面相关内容，让项目更清爽：

- 移除 `App.js` 中所有 `/test/...` 路由和对应 imports
- 移除侧边栏导航配置中的 `开发测试` 分组
- 删除 `frontend/src/pages/TestPage_*.js`
- 删除无路由但同属测试用途的页面
- 保持正式功能可用：任务列表 `/`、Studio `/studio/:taskUuid`
- 构建通过，并减少测试页相关 warning

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要修改后端。
5. 不要改正式业务组件逻辑。
6. 不要删除正式页面：`TaskListPage.js`、`StudioPage.js`。
7. 不要删除正式组件，例如 `Studio.js`、`VideoPlayer.js`、`VttPreviewer.js`、`BlockEditor.js`、`ProjectBubble.js` 等。
8. 只删除测试页面和测试入口，不做大范围 warning 清理。

## 必须移除的范围

### 1. App.js 测试路由

移除 `frontend/src/App.js` 中所有测试页面 import 和路由：

- `/test/video-player`
- `/test/vtt-previewer`
- `/test/markdown`
- `/test/markdownlist`
- `/test/youtube-timestamp`
- `/test/ass-subtitle`
- `/test/keyframe-clip`
- `/test/block-editor`
- `/test/block-drag-to-project`
- `/test/markdown-to-project`

保留：

- `/`
- `/studio/:taskUuid`

可以考虑补一个轻量 404 fallback，但不是必须。如果加 404，不要引入新页面文件。

### 2. 侧边栏导航配置

修改 `frontend/src/config/navigation.js`：

- 删除 `dev` / `开发测试` 分组
- 删除所有 `/test/...` entries
- 删除不再使用的 lucide icon imports
- 保留 `workspace` 分组和 `任务列表`

如果删除后 `Sidebar.js` 的 collapsible group 逻辑仍然能兼容无 collapsible group，则可以保留；如果有明显多余但不影响构建，也可以暂不改。不要为清理而大重构 Sidebar。

### 3. 删除测试页面文件

删除 `frontend/src/pages/` 下所有 `TestPage_*.js` 文件，包括但不限于：

- `TestPage_AssSubtitle.js`
- `TestPage_BlockDragToProject.js`
- `TestPage_BlockEditor.js`
- `TestPage_KeyframeClip.js`
- `TestPage_LayoutCoordination.js`
- `TestPage_MarkdownList.js`
- `TestPage_MarkdownToProject.js`
- `TestPage_MarkdownViewer.js`
- `TestPage_ProjectBubble.js`
- `TestPage_ProjectSystem.js`
- `TestPage_SrtParser.js`
- `TestPage_StudioWorkSpace.js`
- `TestPage_VideoPlayer.js`
- `TestPage_VttPreviewer.js`
- `TestPage_YouTubeTimestamp.js`

### 4. 删除疑似测试普通页面

删除：

- `frontend/src/pages/SubtitleCutPage.jsx`

理由：阶段 3A 审计显示它无路由、无导入引用，属于旧测试/实验页面。

## 删除前检查

删除前必须先运行只读检查，确认这些文件没有被正式代码引用：

- `rg -n "TestPage_|SubtitleCutPage" frontend/src`
- `rg -n "/test/" frontend/src`

如果发现正式代码仍引用测试页面，先记录并只删除确认安全的部分；不要强删导致构建失败。

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- `App.js` 中 10 条 `react/jsx-pascal-case` warning 消失
- `/test/...` 不再出现在 `App.js` 或 `navigation.js`
- `frontend/src/pages/TestPage_*.js` 不存在
- `SubtitleCutPage.jsx` 不存在
- 不新增 Sidebar/navigation warning

构建后可以有历史 warning，例如：

- unused vars/import
- hooks dependency
- a11y
- CSS minimizer `infinity * 1px`
- Browserslist 过期

但如果出现与删除测试页相关的 missing import/module not found，必须修复。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3b-remove-test-pages.md`

报告必须包含：

- `初始状态`
- `删除前引用检查`
- `实际删除文件`
- `实际修改文件`
- `构建验证`
- `warning 变化`
- `最终 git status`
- `风险和不动项`

## 最终回复主控

完成后回复：

- 报告文件路径
- 删除了哪些测试页面
- 修改了哪些文件
- `npm run build` 是否成功
- `/test/...` 是否已全部移除
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push

