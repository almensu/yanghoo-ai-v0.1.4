# 阶段 3H：unused vars 第三批清理（核心组件）

你是 glm。阶段 3H 计划清理核心组件中的剩余 `no-unused-vars`，但执行前必须确认阶段 3G 已提交且工作区干净。

## 执行前硬性检查

开始前必须运行：

```bash
git status --short --untracked-files=all
git log --oneline -3
```

如果工作区不干净，或仍有 3G 变更未提交：

- 立即停止
- 不要修改任何文件
- 回复主控：3G 未提交，不能开始 3H

只有在工作区干净时，才可以继续。

## 目标

清理第三批 `no-unused-vars`，范围限定在：

- `frontend/src/components/Studio.js`
- `frontend/src/components/VideoPlayer.js`

这两个都是核心组件，必须谨慎。目标是删除明显 unused 的 imports / variables，不改业务行为。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 hooks dependency warning。
5. 不要处理 CSS minimizer warning。
6. 不要升级依赖。
7. 不要修改后端。
8. 不要重构组件结构。
9. 不要删除有副作用的代码。
10. 不要处理 `StudioWorkSpace.js`，留给后续单独阶段。

## 允许修改的文件

只允许修改：

- `frontend/src/components/Studio.js`
- `frontend/src/components/VideoPlayer.js`
- `tasks/reports/2026-04-25-stage-3h-unused-vars-batch-3-core-components.md`

如果发现必须改其他文件，停止并报告主控。

## 预期清理项

### 1. `Studio.js`

根据 3G 后 build warning，可能包括：

- `MarkdownViewer`
- `MarkdownWithTimestamps`
- `TimestampFormatTest`
- `navigate`
- `vttErrors`
- `srtFilesToFetch`
- `handleSelectTimeRange`
- `localVideoSrc`

要求：

- 删除前逐个 `rg` / 文件内搜索确认没有使用。
- imports 只删未使用 specifier。
- 对局部变量，如果赋值表达式有副作用，不要删除表达式。
- 对函数如 `handleSelectTimeRange`，确认没有 JSX/回调/子组件 prop 使用再删除。
- 不改 hooks dependency。

### 2. `VideoPlayer.js`

根据 3G 后 build warning，可能包括：

- `setUseAssRenderer`
- `youtubePlayer`
- `setYoutubePlayer`
- 局部 `iframe`
- 局部 `player`

要求：

- 不改 YouTube 初始化行为。
- 如果局部变量赋值是为了触发副作用或文档式占位，不要盲删；先判断。
- `useState` 中 setter 未使用时，可以改成只保留 value，例如 `const [useAssRenderer] = useState(...)`，但要确认 value 仍被读取。
- 如果 value 和 setter 都未使用，可以删除整组 state。
- 如果有多个同名局部 `player`，逐个看上下文，不做批量替换。

## 修复策略

### imports

- 删除未使用 import。
- 不做 import 排序大改。

### state / refs / local variables

- 如果变量完全未使用且初始化无副作用，删除。
- 如果只 setter 未使用，保留 value 或删除整组 state，取决于 value 是否使用。
- 如果删除变量会留下无意义的表达式，谨慎处理并说明。

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- `Studio.js` / `VideoPlayer.js` 目标 `no-unused-vars` warning 消失或明显减少
- 不新增 warning
- 不新增 hooks warning
- 不新增 Sidebar/navigation warning

如果出现 build failure 或行为风险：

- 只修本阶段范围内的问题。
- 如果无法确认，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3h-unused-vars-batch-3-core-components.md`

报告必须包含：

- `执行前检查`
- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `未处理 unused vars`
- `最终 git status`
- `风险和回滚点`

## 最终回复主控

完成后回复：

- 报告文件路径
- 是否确认 3G 已提交且工作区干净
- 修改了哪些文件
- `npm run build` 是否成功
- 清理了多少条 `no-unused-vars`
- 是否新增 warning
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push

