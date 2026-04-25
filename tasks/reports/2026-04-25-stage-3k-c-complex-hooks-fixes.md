# 阶段 3K-C 执行报告：复杂 React hooks warning 修复

执行日期：2026-04-25
执行者：Claude (glm)

## 执行前 git status

- `git status`: 干净（仅 3K-C 任务文件 untracked）
- `git log -3`: `c376c75` docs: 3K-B 报告, `90b7641` refactor: 3K-B 修复, `903829d` docs: 3K-A 返工报告

## 基线 build warning 数量

4 条 `react-hooks/exhaustive-deps`，无 `no-unused-vars`，无 `no-use-before-define`。

## 修改文件列表

| 文件 | 修改类型 |
|------|---------|
| `frontend/src/components/MarkdownWithTimestamps.js` | 移除备用直接调用 handleTimestampClick，移除 placeholderMapRef.current 依赖 |
| `frontend/src/components/StudioWorkSpace.js` | 新增 markdownContentRef + sync effect，fetchFileList 内改用 ref 读取 |

## 每条 warning 的根因分析

### MarkdownWithTimestamps.js:376

**根因**:
1. DOM effect 内有备用分支直接调用 `handleTimestampClick`（line 336-339），导致 eslint 要求将其加入依赖
2. 依赖数组包含 `placeholderMapRef.current`，这是 mutable ref value，不应该是依赖

### StudioWorkSpace.js:212

**根因**: `fetchFileList` 闭包读取 `markdownContent`（line 186）和 `selectedFile`（line 200），但 effect dep array 不包含它们，有意排除以避免循环重执行

## 每条 warning 的修复方式

### MarkdownWithTimestamps.js:376

**修法**:
1. 移除 DOM click listener 中的备用 `handleTimestampClick` 直接调用（line 335-339）。ref 模式保证 `handleTimestampClickRef.current` 始终有值（独立 effect 在 `handleTimestampClick` 变化时同步到 ref）
2. 从 dep array 移除 `placeholderMapRef.current`，改为 `[processedContent, timestampClassName]`

**为什么不会引入旧闭包**: click handler 内始终通过 `handleTimestampClickRef.current` 读取最新 callback，ref 由独立 effect 同步，不存在闭包问题。

**为什么不会引入重复 listener**: dep array 仍包含 `processedContent` 和 `timestampClassName`（触发 DOM 重新绑定的响应式值），cleanup 函数可靠移除旧 listener。

### StudioWorkSpace.js:212

**修法**:
1. 新增 `markdownContentRef` ref，通过独立 effect 同步 `markdownContent` prop 的最新值
2. 已有 `selectedFileRef` ref，补充独立 effect 同步 `selectedFile` state 的最新值
3. `fetchFileList` 内将 `markdownContent` → `markdownContentRef.current`，`selectedFile` → `selectedFileRef.current`
4. dep array 保持 `[taskUuid, apiBaseUrl]` 不变

**为什么不会引入旧闭包**: ref 的 `.current` 在读取时始终是最新值，不受闭包捕获限制。这是有意的非订阅读取 — effect 只在 taskUuid/apiBaseUrl 变化时执行，但执行时读取最新状态值做条件判断。

**为什么不会引入无限循环**: `markdownContent` 和 `selectedFile` 不在 dep array 中，它们的变化不会触发 effect 重执行。选择文件不会导致文件列表重新拉取。

## build 结果

**`npm run build` 成功。**

master 复核结果：

- `git diff --check` 通过。
- `cd frontend && npm run build` 成功。
- 剩余 hooks warning 确认为 2 条：`Studio.js:1171 displayLang`、`VttPreviewer.js:178 videoRef.current`。
- 未新增 `no-unused-vars` / `no-use-before-define`。
- 代码 diff 范围符合 3K-C：`MarkdownWithTimestamps.js` 和 `StudioWorkSpace.js`。

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| 3K-C 2 条 warning 全部消除 | pass |
| 剩余 hooks warning = 2 | pass |
| 不新增 no-unused-vars | pass |
| 不新增 no-use-before-define | pass |
| 不新增其他 eslint warning | pass |

## 剩余 warning 列表

| # | 文件 | 行号 | Warning | 归属 |
|---|------|------|---------|------|
| 1 | Studio.js | 1171 | displayLang | P2 有意排除 |
| 2 | VttPreviewer.js | 178 | videoRef.current | P3 ref.current |

## 是否新增 warning

否。4 条 → 2 条。

## 浏览器/手动回归结果

**未执行浏览器验证。**

原因：当前环境无运行中的 dev server 和浏览器访问能力。建议回归清单：

1. MarkdownWithTimestamps：点击 markdown 中的时间戳按钮 → 视频应跳转到对应时间点
2. MarkdownWithTimestamps：切换 markdown 内容 → 旧 listener 应被移除，新 listener 正常绑定
3. StudioWorkSpace：打开任务 → 文档列表正常加载
4. StudioWorkSpace：无 markdownContent prop 时 → 应自动选择 parallel_summary.md 或第一个文件
5. StudioWorkSpace：有 markdownContent prop 时 → 应显示 prop 内容，不自动选择文件
6. StudioWorkSpace：选择文件后 → 不应触发文件列表重新拉取
7. StudioWorkSpace：保存/删除文档后 → 列表应刷新

## 是否触碰 3K-C 范围外代码

否。仅修改了目标 effect 和相关 ref 逻辑。

## 最终 git status

```
 M frontend/src/components/MarkdownWithTimestamps.js
 M frontend/src/components/StudioWorkSpace.js
?? tasks/2026-04-25-stage-3k-c-complex-hooks-fixes.md
?? tasks/reports/2026-04-25-stage-3k-c-complex-hooks-fixes.md
```

## 本地产物清理

已清理 `tasks/.DS_Store`。`.DS_Store` 受 `.gitignore` 覆盖，不应纳入提交。

## 提交/推送状态

本次返工未改前端代码，未 commit，未 push。
