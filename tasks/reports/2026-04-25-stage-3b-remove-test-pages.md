# 阶段 3B 执行报告：移除前端测试页面

执行日期：2026-04-25
执行者：Claude (glm)

## 初始状态

工作区干净（仅 3A 任务/报告已提交）。

## 删除前引用检查

- `TestPage_*` 仅被 `App.js` import 和路由引用，`Studio.js:292` 有一个注释提及（`// --- Robust VTT Parsing Logic (imported from TestPage_VttPreviewer) ---`），不影响运行
- `/test/` 路由仅在 `App.js` 和 `navigation.js` 中
- `SubtitleCutPage.jsx` 无任何引用
- **结论：全部安全删除**

## 实际删除文件（16 个）

### TestPage 页面（15 个）

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

### 疑似废弃页面（1 个）

- `SubtitleCutPage.jsx`

## 实际修改文件（3 个）

| 文件 | 变更 |
|------|------|
| `frontend/src/App.js` | 移除 10 个 TestPage import、10 个 `/test/` 路由，新增 404 fallback |
| `frontend/src/config/navigation.js` | 移除 dev 分组及 10 个测试入口，保留 workspace 分组（任务列表），移除不再使用的 11 个 lucide icon import |
| `frontend/src/components/Sidebar.js` | 不改（collapsible group 逻辑兼容无 collapsible group 的情况） |

## 构建验证

**`npm run build` 成功。**

主控复跑 `cd frontend && npm run build` 也成功，`/test` 路由无 missing import。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | ✓ |
| `react/jsx-pascal-case` warning 消失 | ✓（0 条，原 10 条） |
| `/test/` 不在 App.js 或 navigation.js | ✓ |
| `TestPage_*.js` 不存在 | ✓ |
| `SubtitleCutPage.jsx` 不存在 | ✓ |
| Sidebar/navigation 无新增 warning | ✓ |
| 正式路由 `/` 和 `/studio/:taskUuid` 保留 | ✓ |

### 复验补充

- `/test` 仅剩报告文字和 `Studio.js` 注释提及，不影响运行。
- build / 系统产生的 `.DS_Store` 已清理：`./.DS_Store`、`tasks/.DS_Store`。
- `.DS_Store` 受 `.gitignore` 覆盖，不应纳入提交。

## warning 变化

| 规则 | 3A | 3B | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 88 | 82 | -6（测试页变量） |
| `react-hooks/exhaustive-deps` | 22 | 18 | -4（测试页 hooks） |
| `react/jsx-pascal-case` | 10 | 0 | **-10（消除）** |
| `no-mixed-operators` | 6 | 4 | -2（测试页） |
| `no-useless-escape` | 5 | 5 | 不变 |
| `jsx-a11y/anchor-is-valid` | 5 | 5 | 不变 |
| `no-cond-assign` | 1 | 1 | 不变 |
| `import/no-anonymous` | 1 | 1 | 不变 |
| **合计** | **138** | **116** | **-22** |

涉及 warning 的文件从 20 个减至 16 个。

## 最终 git status

```
 D frontend/src/pages/SubtitleCutPage.jsx
 D frontend/src/pages/TestPage_AssSubtitle.js
 D frontend/src/pages/TestPage_BlockDragToProject.js
 D frontend/src/pages/TestPage_BlockEditor.js
 D frontend/src/pages/TestPage_KeyframeClip.js
 D frontend/src/pages/TestPage_LayoutCoordination.js
 D frontend/src/pages/TestPage_MarkdownList.js
 D frontend/src/pages/TestPage_MarkdownToProject.js
 D frontend/src/pages/TestPage_MarkdownViewer.js
 D frontend/src/pages/TestPage_ProjectBubble.js
 D frontend/src/pages/TestPage_ProjectSystem.js
 D frontend/src/pages/TestPage_SrtParser.js
 D frontend/src/pages/TestPage_StudioWorkSpace.js
 D frontend/src/pages/TestPage_VideoPlayer.js
 D frontend/src/pages/TestPage_VttPreviewer.js
 D frontend/src/pages/TestPage_YouTubeTimestamp.js
 M frontend/src/App.js
 M frontend/src/config/navigation.js
?? tasks/2026-04-25-stage-3b-remove-test-pages.md
?? tasks/reports/2026-04-25-stage-3b-remove-test-pages.md
```

## 风险和不动项

| 项 | 说明 |
|----|------|
| Studio.js:292 注释引用 TestPage_VttPreviewer | 仅注释，不影响运行，不动 |
| 剩余 116 条历史 warning | 阶段 3C 处理 |
| App.js 硬编码 API 地址 | 后续阶段处理 |
| 404 fallback 用 inline div | 轻量实现，足够当前需要 |
