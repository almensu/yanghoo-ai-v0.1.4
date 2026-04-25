# 阶段 3G 执行报告：unused vars 第二批清理

执行日期：2026-04-25
执行者：Claude (glm)

## 初始状态

- 工作区干净（3F 已提交为 `44bb1c5` + `7996135`）
- 分支：`wt-0.2.0`
- 3F 报告记录 67 条 warning（其中 no-unused-vars 55 条）

## 目标 warning

5 个文件中的 `no-unused-vars`：

| 文件 | 目标条数 |
|------|---------|
| ProjectBubble.js | 9 |
| BlockEditor.js | 16 |
| AIChat.js | 1 |
| KeyframeClipPanel.js | 1 |
| MarkdownWithTimestamps.js | 1 |
| **合计** | **28** |

## 实际修改

### 1. ProjectBubble.js (9 条)

- 移除 6 个 unused lucide icon imports: `ChevronRight`, `ChevronDown`, `Edit3`, `Trash2`, `GripVertical`, `Maximize2`
- `newProject`: 移除变量赋值，保留 `projectManager.createProject()` 调用（有副作用）
- `handleDeleteProject`: 删除整个函数（无 JSX 或其他函数引用）
- `handleDragStart`: 删除整个函数（未被 JSX 调用；`draggedItem` state 保留，仍被 `handleDrop` 使用）

### 2. BlockEditor.js (16 条)

- 移除 13 个 unused lucide icon imports: `Search`, `Edit3`, `ChevronUp`, `ChevronDown`, `Check`, `X`, `Hash`, `Code`, `List`, `Quote`, `Minus`, `Table`, `Image`
- `MarkdownParser`: 移除 unused import
- `isDragging`: 移除 state 和 3 处 `setIsDragging` 调用（值从未被读取）

### 3. AIChat.js (1 条)

- `dragCounter`: 移除 state 和 5 处 `setDragCounter` 调用（值从未被读取）
- 保留 `isDragOver` state（被 JSX 条件渲染使用）

### 4. KeyframeClipPanel.js (1 条)

- `timelineRef`: 移除 ref 声明（无 JSX ref 绑定，无逻辑引用）

### 5. MarkdownWithTimestamps.js (1 条)

- `lastClickedTimestamp`: 移除 state 和 5 处 `setLastClickedTimestamp` 调用（值从未被读取）

## 行为等价说明

- 所有移除的 state 值（`isDragging`, `dragCounter`, `lastClickedTimestamp`）从未被读取，setter 调用无实际效果
- `draggedItem` state 保留：虽然 `handleDragStart` 被删除，`handleDrop` 仍检查 `draggedItem`，但该分支永远不会被触发（因为没有函数设置 draggedItem）
- `projectManager.createProject()` 调用保留：仅移除返回值赋值
- 删除 `handleDeleteProject`/`handleDragStart` 函数不影响运行：它们无调用点

## 构建验证

**`npm run build` 成功。**

主控复跑 `cd frontend && npm run build` 成功。目标 5 文件的 `no-unused-vars` warning 已清掉，没有新增 warning；剩余 warning 为 Studio/VideoPlayer/StudioWorkSpace hooks 和 unused，以及 CSS minimizer/Browserslist 等。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| 目标 5 文件的 `no-unused-vars` warning 消失 | pass |
| 不新增 warning | pass |
| 不新增 hooks warning | pass |

### 返工记录

初次构建失败：AIChat.js 中遗漏 2 处 `setDragCounter` 调用未删除。已修复，第二次构建成功。

## warning 变化

| 规则 | 3F | 3G | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 55 | 28 | **-27** |
| `react-hooks/exhaustive-deps` | 12 | 12 | 不变 |
| **合计** | **67** | **40** | **-27** |

## 未处理 unused vars

留给后续批次（3G 任务约束排除）：

| 文件 | 条数 | 说明 |
|------|------|------|
| Studio.js | 5 | MarkdownViewer/MarkdownWithTimestamps import、navigate、vttErrors、srtFilesToFetch |
| VideoPlayer.js | 8 | YouTube player 变量、setUseAssRenderer 等 |
| StudioWorkSpace.js | 未统计 | 约束排除 |

## 最终 git status

```
 M frontend/src/components/AIChat.js
 M frontend/src/components/BlockEditor.js
 M frontend/src/components/KeyframeClipPanel.js
 M frontend/src/components/MarkdownWithTimestamps.js
 M frontend/src/components/ProjectBubble.js
?? tasks/2026-04-25-stage-3g-unused-vars-batch-2.md
?? tasks/reports/2026-04-25-stage-3g-unused-vars-batch-2.md
```

## 本地产物清理

主控复验后发现 `tasks/.DS_Store`，已清理。`.DS_Store` 受 `.gitignore` 覆盖，不应纳入提交。

## 风险和回滚点

| 项 | 说明 |
|----|------|
| 回滚方式 | `git checkout -- frontend/src/components/AIChat.js frontend/src/components/BlockEditor.js frontend/src/components/KeyframeClipPanel.js frontend/src/components/MarkdownWithTimestamps.js frontend/src/components/ProjectBubble.js` |
| handleDeleteProject | 当前无调用点，删除安全；若后续需删除项目功能需重新实现 |
| handleDragStart | 当前无调用点，删除安全；draggedItem state 成为死代码，作为后续可清理项保留。本轮为保持低风险，不继续删除该 state 和 `handleDrop` 内部分支 |
| AIChat dragCounter | 原为计数器模式未完成实现，移除不影响拖拽UI |
| 未 commit/push | 所有变更仅在工作区 |
