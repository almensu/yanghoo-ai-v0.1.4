# 阶段 3F 执行报告：unused vars 第一批清理

执行日期：2026-04-25
执行者：Claude (glm)

## 初始状态

- 工作区干净（3E 已提交为 `87eb7b4` + `037ef34`）
- 分支：`wt-0.2.0`
- 3E 报告记录 94 条 warning（其中 no-unused-vars 82 条）

## 目标 warning

7 个文件中的 `no-unused-vars`，预计约 27 条。

## 实际修改

### 1. MarkdownViewer.js — 移除 unused imports (4 条)

```js
// Before
import React, { useEffect, useState, useCallback } from "react";
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from "../utils/tokenUtils";

// After
import React, { useCallback } from "react";
```

移除 `useEffect`、`useState`（未使用），以及 `estimateTokenCount`、`formatTokenCount`、`getTokenCountColorClass`（全部未使用）。

注意：初次误删了 `timeToSeconds` import（文件中有使用），构建失败后已恢复。

### 2. QuickCollector.js — 移除 unused isHovered state (1 条)

```js
// Before
const [isHovered, setIsHovered] = useState(false);
// ... onMouseEnter={() => setIsHovered(true)}
// ... onMouseLeave={() => setIsHovered(false)}

// After: 整个 state 和两个 handler 移除
```

`isHovered` 从未被读取，`setIsHovered` 调用无任何效果。

### 3. VttPreviewer.js — 移除 unused imports (2 条)

```js
// Before
import { WebVTTParser } from 'webvtt-parser';
import { formatTime } from '../utils/formatTime';

// After: 两行均删除
```

两个 import 在文件中无任何使用。

### 4. TaskList.js — 移除 unused setSearchTerm (1 条)

```js
// Before
const [searchTerm, setSearchTerm] = useState('');

// After
const [searchTerm] = useState('');
```

`searchTerm` 仍用于过滤逻辑，仅 setter 未使用。

### 5. TaskListPage.js — 移除 unused data 变量 (1 条)

```js
// Before
const data = await res.json();

// After
await res.json();  // 消费 response body 但不赋值
```

保留 `res.json()` 调用（消费 response body），仅移除未使用的变量名。

### 6. CardView.js — 移除 unused lucide icons + rawSrtFilesExist + hasRawSrtFiles (9 条)

```js
// Before: 7 个未使用 icon
ListVideo, ServerCrash, CheckCircle2, AlertCircle, XCircle, HelpCircle, MoreVertical

// After: 全部移除
```

移除 `rawSrtFilesExist` 变量及其定义函数 `hasRawSrtFiles`（函数仅被该变量调用，变量移除后函数也变为 unused）。

### 7. TableView.js — 移除 unused lucide icons + ChevronDown + rawSrtFilesExist + hasRawSrtFiles (10 条)

与 CardView.js 相同模式。移除 8 个未使用 icon import + `rawSrtFilesExist` 变量 + `hasRawSrtFiles` 函数。

## 行为等价说明

- 所有修改仅删除未使用的代码，不改变任何运行路径
- `res.json()` 保留调用确保 HTTP response body 被正确消费
- daisyUI 样式不受影响——移除的都是 JS imports，不涉及 CSS
- `onMouseEnter/Leave` handler 的移除不影响视觉效果（无 CSS :hover 依赖该 state）

## 构建验证

**`npm run build` 成功。**

主控复跑 `cd frontend && npm run build` 成功。目标文件中的 `no-unused-vars` warning 不再出现，没有新增 hooks warning；剩余 warning 为后续批次中的 Studio/VideoPlayer/ProjectBubble/BlockEditor/AIChat/KeyframeClipPanel/MarkdownWithTimestamps/StudioWorkSpace hooks 和 unused 等。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| 目标 7 文件的 `no-unused-vars` warning 消失 | pass |
| 不新增 warning | pass |
| 不新增 hooks warning | pass |
| 不新增 Sidebar/navigation warning | pass |

### 返工记录

初次构建失败：误删了 `MarkdownViewer.js` 中的 `timeToSeconds` import（该函数在 timestamp click handler 中有使用）。已恢复 import，第二次构建成功。

## warning 变化

| 规则 | 3E | 3F | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 82 | 55 | **-27** |
| `react-hooks/exhaustive-deps` | 12 | 12 | 不变 |
| **合计** | **94** | **67** | **-27** |

## 未处理 unused vars

以下文件的 unused warning 留给后续批次（3F 任务约束明确排除）：

| 文件 | 条数 | 说明 |
|------|------|------|
| Studio.js | 5 | MarkdownViewer/MarkdownWithTimestamps import、navigate、vttErrors 等 |
| VideoPlayer.js | 8 | YouTube player 相关变量、setUseAssRenderer 等 |
| ProjectBubble.js | 8 | 未使用 icon imports、handleDeleteProject、handleDragStart 等 |
| BlockEditor.js | 16 | 大量未使用 icon imports 和 MarkdownParser |
| AIChat.js | 1 | dragCounter |
| KeyframeClipPanel.js | 1 | timelineRef |
| MarkdownWithTimestamps.js | 1 | lastClickedTimestamp |

## 最终 git status

```
 M frontend/src/components/CardView.js
 M frontend/src/components/MarkdownViewer.js
 M frontend/src/components/QuickCollector.js
 M frontend/src/components/TableView.js
 M frontend/src/components/TaskList.js
 M frontend/src/components/VttPreviewer.js
 M frontend/src/pages/TaskListPage.js
?? tasks/2026-04-25-stage-3f-unused-vars-batch-1.md
?? tasks/reports/2026-04-25-stage-3f-unused-vars-batch-1.md
```

## 本地产物清理

主控复验后发现 `tasks/.DS_Store`，已清理。`.DS_Store` 受 `.gitignore` 覆盖，不应纳入提交。

## 风险和回滚点

| 项 | 说明 |
|----|------|
| 回滚方式 | `git checkout -- frontend/src/components/CardView.js frontend/src/components/MarkdownViewer.js frontend/src/components/QuickCollector.js frontend/src/components/TableView.js frontend/src/components/TaskList.js frontend/src/components/VttPreviewer.js frontend/src/pages/TaskListPage.js` |
| MarkdownViewer 误删修复 | 已恢复 timeToSeconds import，构建通过 |
| QuickCollector hover handler | 移除后不影响视觉效果，handler 未驱动任何 UI state |
| hasRawSrtFiles 函数 | 移除前确认无其他调用点，安全 |
| 未 commit/push | 所有变更仅在工作区 |
