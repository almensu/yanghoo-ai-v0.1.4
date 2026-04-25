# 阶段 3K-C：复杂 React hooks warning 修复

你是 glm。阶段 3K-A / 3K-B 已完成并提交，当前 build 预期只剩 4 条 `react-hooks/exhaustive-deps` warning。现在进入 3K-C，只处理其中 2 条需要设计判断的复杂 hooks warning。

## 背景

已完成：

- 3K-A：低风险 hooks warning 12 → 8
- 3K-B：中风险 hooks warning 8 → 4
- 当前剩余 warning 预期为：
  - `MarkdownWithTimestamps.js:376`
  - `Studio.js:1171 displayLang`
  - `StudioWorkSpace.js:212 markdownContent / selectedFile`
  - `VttPreviewer.js:178 videoRef.current`

参考报告：

- `tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md`
- `tasks/reports/2026-04-25-stage-3k-a-low-risk-hooks-fixes.md`
- `tasks/reports/2026-04-25-stage-3k-b-medium-risk-hooks-fixes.md`

## 本阶段范围

只处理以下 2 条 warning：

1. `MarkdownWithTimestamps.js:376`
   - missing dependency `handleTimestampClick`
   - unnecessary/invalid dependency `placeholderMapRef.current`

2. `StudioWorkSpace.js:212`
   - missing dependencies `markdownContent` and `selectedFile`

## 不处理范围

不要修复以下 warning：

- `Studio.js:1171 displayLang`
- `VttPreviewer.js:178 videoRef.current`

不要处理 CSS minimizer / Browserslist warning。

## 目标

在保持行为等价、避免渲染循环和旧闭包的前提下，消除 3K-C 范围内 2 条 hooks warning。

预期结果：

- `npm run build` 成功
- hooks warning 从 4 条降到 2 条
- 剩余 hooks warning 只应为：
  - `Studio.js:1171 displayLang`
  - `VttPreviewer.js:178 videoRef.current`
- 不新增 `no-unused-vars`
- 不新增 `no-use-before-define`
- 不新增其他 eslint warning

## 强制约束

1. 只修改必要前端文件和本阶段报告。
2. 不要修改后端。
3. 不要升级依赖。
4. 不要格式化无关文件。
5. 不要修复 3K-C 范围外 warning。
6. 默认不要用 `eslint-disable` 解决本阶段 warning；如果必须使用，先在报告中证明没有更好的结构化修法。
7. 不要 commit。
8. 不要 push。
9. 如果发现工作区不干净，先停止并报告主控。

## 执行前检查

运行：

```bash
git status --short --untracked-files=all
git log --oneline -6
```

要求：

- 工作区干净，或只存在本任务文件未跟踪。
- 如果存在其他 modified/untracked 文件，停止并报告。

## 执行步骤

### Step 1 - 构建基线

运行：

```bash
cd frontend
npm run build
```

记录当前剩余 hooks warning。预期为 4 条。

如果不是 4 条，先停止并报告主控，不要直接修。

### Step 2 - 分析 MarkdownWithTimestamps

文件：

`frontend/src/components/MarkdownWithTimestamps.js`

目标 warning：

`useEffect` missing dependency `handleTimestampClick`，且 `placeholderMapRef.current` 不是有效依赖。

当前已知结构：

- `handleTimestampClickRef` 保存最新 `handleTimestampClick`
- `placeholderMapRef` 保存占位符映射
- DOM click listener 里优先调用 `handleTimestampClickRef.current`
- effect dependency 目前包含 `placeholderMapRef.current`

推荐修法方向：

- 保留 ref 保存最新 callback 的模式。
- 从 effect dependency array 移除 `placeholderMapRef.current`。
- effect 内只读取 `placeholderMapRef.current` 的当前快照，不把 ref.current 当订阅源。
- 尽量移除 DOM listener 里的备用直接调用 `handleTimestampClick`，避免 effect 必须依赖它；如果保留直接调用，则必须解释为什么不会旧闭包。
- effect dependency 应只包含会触发重新绑定 listener 的响应式值，例如 `processedContent`、`timestampClassName`，以及必要的稳定 callback/ref。

注意：

- 不要改变时间戳点击行为。
- 不要改变 markdown 渲染和 placeholder 替换逻辑。
- 不要引入重复事件监听器。
- cleanup 必须仍然可靠移除 listener。

验收点：

- `MarkdownWithTimestamps.js:376` warning 消失。
- 点击时间戳仍通过最新 `handleTimestampClickRef.current` 执行。

### Step 3 - 分析 StudioWorkSpace

文件：

`frontend/src/components/StudioWorkSpace.js`

目标 warning：

`useEffect` missing dependencies `markdownContent` and `selectedFile`

当前已知结构：

- `currentMarkdownContent` 初始来自 `markdownContent || ''`
- `fetchDocFiles` 会读取 `markdownContent` 和 `selectedFile`
- `useEffect` 调用 `fetchDocFiles()`
- 3K-A 已将 `fetchDocFiles` 包进 `useCallback`
- 不能简单把 `markdownContent` / `selectedFile` 加到外层 effect 后导致循环或无意义重复拉取

推荐修法方向：

- 优先让 `fetchDocFiles` 的依赖完整，并让调用它的 effect 只依赖稳定后的 `fetchDocFiles`。
- 如果 `fetchDocFiles` 不应该因 `selectedFile` 改变而重新拉列表，应把需要的状态读取改为 ref 或把逻辑拆分：
  - 文件列表拉取只依赖 `taskUuid`、`apiBaseUrl`
  - prop fallback / selected file 默认选择逻辑用单独 effect 表达
- 避免“为了消 warning”把 `markdownContent`、`selectedFile` 粗暴塞入 effect，造成每次选中文件都重新拉列表。
- 如果使用 ref 保存 `selectedFile` 或 `markdownContent` 最新值，必须说明为什么这是有意的非订阅读取。

注意：

- 不要改变文件列表加载行为。
- 不要改变文件选择、默认文件选择、prop markdown fallback 行为。
- 不要引入无限循环。
- 不要破坏保存、重命名、删除文档后的 refresh 行为。

验收点：

- `StudioWorkSpace.js:212` warning 消失。
- `fetchDocFiles` 仍可被保存/删除/重命名后刷新使用。
- 选择文件不应导致无意义的文件列表重复拉取。

### Step 4 - 构建验证

运行：

```bash
cd frontend
npm run build
```

验收标准：

- build 成功
- 3K-C 两条 warning 消失
- 剩余 hooks warning 预期为 2 条
- 剩余 warning 只能是：
  - `Studio.js:1171 displayLang`
  - `VttPreviewer.js:178 videoRef.current`
- 不新增 `no-unused-vars`
- 不新增 `no-use-before-define`
- 不新增新的 eslint warning

如果 build 失败或新增 warning：

1. 先定位是否由本阶段改动引起。
2. 只修复本阶段引入的问题。
3. 重新 build。
4. 在报告中记录失败原因和修复方式。

### Step 5 - 回归说明

本阶段报告必须给出手动回归清单。至少覆盖：

- `MarkdownWithTimestamps`：点击 markdown 中的时间戳，视频跳转或回调行为仍正常。
- `MarkdownWithTimestamps`：切换 markdown 内容后，旧时间戳 listener 不重复触发。
- `StudioWorkSpace`：打开任务后文档列表仍能加载。
- `StudioWorkSpace`：选择文档后内容加载正常，不重复刷列表。
- `StudioWorkSpace`：无选中文件但有 `markdownContent` prop 时，fallback 内容仍正常显示。

如果无法实际浏览器验证，必须明确写“未执行浏览器验证”，并说明原因，不能写成已验证。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3k-c-complex-hooks-fixes.md`

报告必须包含：

- 执行前 git status
- 基线 build warning 数量
- 修改文件列表
- 每条 warning 的根因分析
- 每条 warning 的修复方式
- 为什么不会引入旧闭包
- 为什么不会引入重复 listener 或无限循环
- build 结果
- 剩余 warning 列表
- 是否新增 warning
- 浏览器/手动回归结果或未执行说明
- 是否触碰 3K-C 范围外代码
- 最终 git status
- 明确说明未 commit、未 push

## 最终回复主控

完成后回复：

- 修改了哪些文件
- 2 条目标 warning 是否全部消除
- 当前剩余 hooks warning 数量
- build 是否成功
- 是否做过浏览器验证
- 报告路径
- `git status --short --untracked-files=all`
- 是否 commit/push

