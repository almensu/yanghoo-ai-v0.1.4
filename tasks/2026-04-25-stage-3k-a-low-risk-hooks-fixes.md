# 阶段 3K-A：低风险 React hooks warning 修复

你是 glm。阶段 3J 已完成 hooks warning 审计。现在进入 3K-A，只修复 3J 报告中标记为低风险、适合先处理的 4 条 `react-hooks/exhaustive-deps` warning。

## 背景

3J 审计报告路径：

`tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md`

当前 build 已确认：

- 构建成功
- 剩余 12 条 `react-hooks/exhaustive-deps`
- 无 `no-unused-vars`
- CSS minimizer / Browserslist warning 暂不处理

3K-A 只处理以下 4 条：

1. `AIChat.js:135` — missing dependency `fetchMarkdownFiles`
2. `BlockEditor.js:51` — missing dependency `updateBlocks`
3. `Studio.js:23` — missing dependency `fetchTasks`
4. `StudioWorkSpace.js:217` — missing dependency `fetchDocFiles`

## 目标

在不改变业务行为的前提下，消除上述 4 条低风险 hooks warning。

预期结果：

- `npm run build` 成功
- `react-hooks/exhaustive-deps` warning 从 12 条降到 8 条
- 不新增 `no-unused-vars`
- 不新增其他 eslint warning
- 不处理 3K-B / 3K-C 范围

## 强制约束

1. 只修改必要前端文件和本阶段报告。
2. 不要修改后端。
3. 不要处理 CSS minimizer warning。
4. 不要升级依赖。
5. 不要格式化无关文件。
6. 不要修复 3K-A 范围外的 hooks warning。
7. 不要 commit。
8. 不要 push。
9. 不要删除或改写 3J 任务文件和 3J 审计报告。

## 执行前检查

运行：

```bash
git status --short --untracked-files=all
git log --oneline -3
```

允许存在以下 3J 文档和本 3K-A 任务文件：

```text
?? tasks/2026-04-25-stage-3j-hooks-warning-audit.md
?? tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md
?? tasks/2026-04-25-stage-3k-a-low-risk-hooks-fixes.md
```

如果除此之外还有不相关改动，先停止并报告主控，不要自行覆盖。

## 执行步骤

### Step 1 - 阅读 3J 审计结论

阅读：

```bash
sed -n '1,340p' tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md
```

确认 3K-A 范围只包含：

- `AIChat.js`
- `BlockEditor.js`
- `Studio.js` 中的 `VideoTaskSelector`
- `StudioWorkSpace.js` 中的 `fetchDocFiles`

### Step 2 - 修复 AIChat.js

文件：

`frontend/src/components/AIChat.js`

目标 warning：

`useEffect` missing dependency `fetchMarkdownFiles`

推荐修法：

- 将 `fetchMarkdownFiles` 用 `useCallback` 稳定。
- 依赖应包含它实际读取的外部值，例如 `taskUuid`、`apiBaseUrl`。
- `useEffect` 依赖数组改为依赖稳定后的 `fetchMarkdownFiles`。

注意：

- 不要改变接口请求路径。
- 不要改变任务为空时的行为。
- 如果新增 `useCallback` import，要确认没有 unused import。

### Step 3 - 修复 BlockEditor.js

文件：

`frontend/src/components/BlockEditor.js`

目标 warning：

`useEffect` missing dependency `updateBlocks`

推荐修法：

- 优先把 `updateBlocks` 逻辑内联到 effect，或用 `useCallback` 稳定。
- 选择改动最小、最符合当前文件风格的方式。
- 确保不会导致 effect 无限循环。

注意：

- 不要改变 block 初始化、同步、回传逻辑。
- 如果函数只被一个 effect 使用，内联通常更清爽。

### Step 4 - 修复 Studio.js 的 VideoTaskSelector

文件：

`frontend/src/components/Studio.js`

目标 warning：

`VideoTaskSelector` 内部 `useEffect` missing dependency `fetchTasks`

推荐修法：

- 只处理文件顶部 `VideoTaskSelector` 组件内的 `fetchTasks`。
- 将 `fetchTasks` 用 `useCallback` 稳定，或把请求逻辑移入 effect。
- 依赖数组要体现实际依赖。

注意：

- 不要碰 `Studio.js` 其他 hooks warning。
- 不要处理 `displayLang`、`optimizeSubtitleTiming`、`taskDetails.ass_files`。
- 不要重构主 `Studio` 组件。

### Step 5 - 修复 StudioWorkSpace.js 的 fetchDocFiles

文件：

`frontend/src/components/StudioWorkSpace.js`

目标 warning：

`useEffect` missing dependency `fetchDocFiles`

推荐修法：

- 将 `fetchDocFiles` 用 `useCallback` 稳定，依赖包含它读取的外部值。
- 对调用它的 effect 添加稳定后的 `fetchDocFiles` 依赖。

注意：

- 不要处理 `StudioWorkSpace.js:212` 的 `markdownContent` / `selectedFile` warning，那属于 3K-C。
- 不要改变文档列表加载时机，除非这是消除旧闭包风险所必需。

### Step 6 - 构建验证

运行：

```bash
cd frontend
npm run build
```

验收标准：

- build 成功
- 3K-A 四条 warning 消失
- 剩余 hooks warning 预期为 8 条
- 不新增 `no-unused-vars`
- 不新增新的 eslint warning

如果 build 失败：

1. 先定位是否由本阶段改动引起。
2. 只修复本阶段引入的问题。
3. 重新 build。
4. 在报告中记录失败原因和修复方式。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3k-a-low-risk-hooks-fixes.md`

报告必须包含：

- 执行前 git status
- 修改文件列表
- 每条 warning 的修复方式
- build 结果
- 剩余 warning 列表或摘要
- 是否新增 warning
- 是否触碰 3K-A 范围外代码
- 最终 git status
- 明确说明未 commit、未 push

## 禁止事项

不要修复以下 warning：

- `MarkdownWithTimestamps.js:376`
- `Studio.js:1171 displayLang`
- `Studio.js:1256 optimizeSubtitleTiming`
- `Studio.js:1653 taskDetails.ass_files`
- `StudioWorkSpace.js:212 markdownContent / selectedFile`
- `VideoPlayer.js:1136 initializeYouTubePlayer`
- `VideoPlayer.js:1204 initializeYouTubePlayer`
- `VttPreviewer.js:178 videoRef.current`

不要用 `eslint-disable` 解决本阶段 4 条 warning，除非你能证明这是唯一合理方案；默认不允许。

## 最终回复主控

完成后回复：

- 修改了哪些文件
- 4 条目标 warning 是否全部消除
- 当前剩余 hooks warning 数量
- build 是否成功
- 报告路径
- `git status --short --untracked-files=all`
- 是否 commit/push

