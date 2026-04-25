# 阶段 3C：真实风险 warning 修复

你是 glm。阶段 3B 已移除全部前端测试页面和测试路由，当前工作区应干净。阶段 3C 只处理最像真实 bug 的 warning，不做大规模 unused vars 清理。

## 目标

优先修复可能影响运行行为的 warning：

1. `MarkdownWithTimestamps.js:280` 的 `no-cond-assign`
2. `MarkdownWithTimestamps.js` / `VideoPlayer.js` 的 ref cleanup stale value
3. `KeyframeClipPanel.js` 中高风险 hooks dependency warning

本阶段目标不是清空 warning，而是降低真实 bug 风险。

## 强制约束

1. 不要 commit。
2. 不要 push。
3. 不要改写历史。
4. 不要处理 `no-unused-vars` 大清理。
5. 不要处理 a11y anchor warning。
6. 不要处理 CSS minimizer warning。
7. 不要升级依赖。
8. 不要修改后端。
9. 不要重构大组件结构。
10. 如果无法确认行为等价，停止并报告主控，不要猜。

## 允许修改的文件

优先只允许修改：

- `frontend/src/components/MarkdownWithTimestamps.js`
- `frontend/src/components/VideoPlayer.js`
- `frontend/src/components/KeyframeClipPanel.js`
- `tasks/reports/2026-04-25-stage-3c-real-risk-warning-fixes.md`

如确需修改其他文件，先停止并说明原因。

## 执行步骤

### Step 1 - 初始扫描

记录：

- `git status --short --untracked-files=all`
- 最近 3 个 commit
- `npm run build` 当前 warning 中与本阶段目标相关的条目

### Step 2 - 修复 `MarkdownWithTimestamps.js:280`

先阅读 `MarkdownWithTimestamps.js` 第 240-310 行上下文。

目标 warning：

```text
Expected a conditional expression and instead saw an assignment no-cond-assign
```

要求：

- 判断这是否是误写 `=`，还是有意赋值。
- 如果是误写，改为比较或改写为明确的布尔条件。
- 如果是有意赋值，改成更清楚的两步写法，避免在条件表达式里赋值。
- 保持原行为，除非明确发现 bug。
- 在报告中解释判断依据。

### Step 3 - 修复 ref cleanup stale value

目标 warning：

- `MarkdownWithTimestamps.js:378`
- `VideoPlayer.js:835`

典型修法：

```js
useEffect(() => {
  const node = ref.current;
  if (!node) return;

  node.addEventListener(...);
  return () => {
    node.removeEventListener(...);
  };
}, [...]);
```

要求：

- 不改变事件绑定逻辑。
- 不改变依赖语义。
- 只把 cleanup 使用的 `ref.current` 固定到 effect 内局部变量。
- 如果某处不是事件 listener，而是其他 cleanup，也用同样原则处理。

### Step 4 - 审慎处理 `KeyframeClipPanel.js`

目标 warning：

- `KeyframeClipPanel.js:43` missing `loadKeyframes` / `loadStats`
- `KeyframeClipPanel.js:85` missing `startLoopPlayingSegment` / `stopLoopPlaying`
- `KeyframeClipPanel.js:396` missing `handleFrameClick` / `keyframes`
- `KeyframeClipPanel.js:511` missing `stopLoopPlaying` / `togglePlayPause`

处理策略：

- 优先修前两处 mount/loop 相关 effect，风险较高。
- 使用 `useCallback` 稳定函数，或将函数定义移动/调整到 effect 内。
- 不要为了消 warning 造成无限循环。
- 不要大规模重排组件。
- 如果 396/511 涉及复杂 callback 链，允许暂缓，但报告必须说明原因。

### Step 5 - 验证

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- `MarkdownWithTimestamps.js:280` 的 `no-cond-assign` 消失
- 修过的 ref cleanup warning 消失
- 修过的 `KeyframeClipPanel.js` hook warning 消失
- 不新增新的 warning
- 不新增 Sidebar/navigation warning

如果某个 warning 暂缓，报告必须明确说明。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3c-real-risk-warning-fixes.md`

报告必须包含：

- `初始状态`
- `目标 warning`
- `实际修改`
- `行为等价说明`
- `构建验证`
- `warning 变化`
- `暂缓项`
- `最终 git status`
- `风险和回滚点`

## 最终回复主控

完成后回复：

- 报告文件路径
- 修改了哪些文件
- `npm run build` 是否成功
- 修复了哪些 warning
- 哪些 warning 暂缓及原因
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push

