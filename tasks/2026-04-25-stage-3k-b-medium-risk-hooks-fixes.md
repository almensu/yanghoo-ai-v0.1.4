# 阶段 3K-B：中风险 React hooks warning 修复

你是 glm。阶段 3K-A 已完成并提交，当前工作区应为干净。现在进入 3K-B，只修复 3J 审计中归为中风险、需要更谨慎验证的 4 条 `react-hooks/exhaustive-deps` warning。

## 背景

已完成：

- 3K-A 消除了 4 条低风险 hooks warning
- 当前 build 预期剩余 8 条 hooks warning
- 3K-B 只处理其中 4 条

参考报告：

- `tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md`
- `tasks/reports/2026-04-25-stage-3k-a-low-risk-hooks-fixes.md`

## 本阶段范围

只处理以下 4 条 warning：

1. `Studio.js:1256` — missing dependency `optimizeSubtitleTiming`
2. `Studio.js:1653` — `useCallback` missing dependency `taskDetails.ass_files`
3. `VideoPlayer.js:1136` — missing dependency `initializeYouTubePlayer`
4. `VideoPlayer.js:1204` — missing dependency `initializeYouTubePlayer`

## 不处理范围

不要修复以下 warning：

- `MarkdownWithTimestamps.js:376` — 归 3K-C
- `Studio.js:1171 displayLang` — 3J 判定为有意排除，暂缓
- `StudioWorkSpace.js:212 markdownContent / selectedFile` — 归 3K-C
- `VttPreviewer.js:178 videoRef.current` — P3，后续单独处理或保留注释

不要处理 CSS minimizer / Browserslist warning。

## 目标

在保持行为等价的前提下，消除 3K-B 范围内 4 条 hooks warning。

预期结果：

- `npm run build` 成功
- hooks warning 从 8 条降到 4 条
- 不新增 `no-unused-vars`
- 不新增 `no-use-before-define`
- 不新增其他 eslint warning
- VideoPlayer 相关播放初始化逻辑保持可用

## 强制约束

1. 只修改必要前端文件和本阶段报告。
2. 不要修改后端。
3. 不要升级依赖。
4. 不要格式化无关文件。
5. 不要修复 3K-B 范围外 warning。
6. 不要用 `eslint-disable` 解决本阶段 warning。
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

记录当前剩余 hooks warning。预期为 8 条。

如果不是 8 条，先停止并报告主控，不要直接修。

### Step 2 - 修复 Studio.js:1256 optimizeSubtitleTiming

文件：

`frontend/src/components/Studio.js`

目标 warning：

`useEffect` missing dependency `optimizeSubtitleTiming`

要求：

- 阅读 `optimizeSubtitleTiming` 定义和调用上下文。
- 优先选择最小改动：如果函数已经稳定，补齐依赖；如果函数不稳定，先用 `useCallback` 稳定，再补齐依赖。
- 防止 effect 因函数引用变化而重复执行。
- 不要触碰 `displayLang` warning。
- 不要重构主 `Studio` 组件。

验收点：

- `Studio.js:1256` warning 消失。
- 没有新增 `no-use-before-define`。

### Step 3 - 修复 Studio.js:1653 taskDetails.ass_files

文件：

`frontend/src/components/Studio.js`

目标 warning：

`useCallback` missing dependency `taskDetails.ass_files`

要求：

- 阅读该 callback 里对 `taskDetails.ass_files` 的使用。
- 优先直接将 `taskDetails.ass_files` 加入依赖数组。
- 如果当前代码需要防止 `taskDetails` 为 null，使用已有的可选链或等价安全访问。
- 不要扩大为整个 `taskDetails` 依赖，除非能证明必须这样做；优先依赖具体字段，避免 callback 过度变化。

验收点：

- `Studio.js:1653` warning 消失。
- 相关剪辑/字幕文件路径逻辑不变。

### Step 4 - 修复 VideoPlayer.js 两条 initializeYouTubePlayer warning

文件：

`frontend/src/components/VideoPlayer.js`

目标 warning：

- `VideoPlayer.js:1136` missing dependency `initializeYouTubePlayer`
- `VideoPlayer.js:1204` missing dependency `initializeYouTubePlayer`

要求：

- 这两条必须作为同一个问题一起处理。
- 阅读 `initializeYouTubePlayer` 函数定义，以及两个 effect 的完整上下文。
- 优先将 `initializeYouTubePlayer` 用 `useCallback` 稳定，并把它加入两个 effect 的依赖数组。
- `useCallback` 的依赖必须完整，不能为了消 warning 留下旧闭包。
- 如果 `initializeYouTubePlayer` 读取的是 ref、DOM、`window.YT` 等非响应式对象，依赖数组可以为空，但报告里必须说明依据。
- 如果它读取 props/state，必须补齐对应依赖。
- 不要改变本地视频与 YouTube/embed 视频的切换逻辑。
- 不要改变事件监听器添加/移除的成对关系。

验收点：

- 两条 VideoPlayer warning 均消失。
- 没有新增 event listener 泄漏风险。
- 没有新增 `no-use-before-define`。

### Step 5 - 浏览器/手动回归说明

由于 VideoPlayer 涉及播放器初始化，本阶段报告必须写出浏览器回归清单。

如果你能实际运行并验证，请记录结果。至少覆盖：

- 打开包含视频的 Studio 页面。
- 本地视频可以正常渲染。
- YouTube/embed 地址模式下播放器初始化逻辑没有报错。
- 切换视频来源后不会重复创建异常播放器实例。

如果你无法实际做浏览器验证，必须明确写“未执行浏览器验证”，并说明原因，不能写成已验证。

### Step 6 - 构建验证

运行：

```bash
cd frontend
npm run build
```

验收标准：

- build 成功
- 3K-B 四条 warning 消失
- 剩余 hooks warning 预期为 4 条
- 不新增 `no-unused-vars`
- 不新增 `no-use-before-define`
- 不新增新的 eslint warning

如果 build 失败或新增 warning：

1. 先定位是否由本阶段改动引起。
2. 只修复本阶段引入的问题。
3. 重新 build。
4. 在报告中记录失败原因和修复方式。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3k-b-medium-risk-hooks-fixes.md`

报告必须包含：

- 执行前 git status
- 基线 build warning 数量
- 修改文件列表
- 每条 warning 的修复方式
- `initializeYouTubePlayer` 依赖分析
- build 结果
- 剩余 warning 列表或摘要
- 是否新增 warning
- 浏览器/手动回归结果或未执行说明
- 是否触碰 3K-B 范围外代码
- 最终 git status
- 明确说明未 commit、未 push

## 最终回复主控

完成后回复：

- 修改了哪些文件
- 4 条目标 warning 是否全部消除
- 当前剩余 hooks warning 数量
- build 是否成功
- VideoPlayer 是否做过浏览器验证
- 报告路径
- `git status --short --untracked-files=all`
- 是否 commit/push

