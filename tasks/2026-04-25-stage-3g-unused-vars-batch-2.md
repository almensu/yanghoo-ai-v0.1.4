# 阶段 3G：unused vars 第二批清理

你是 glm。阶段 3F 已完成第一批 unused vars 清理。阶段 3G 继续清理 `no-unused-vars`，但仍然保持小范围、低风险。

## 目标

清理第二批明显未使用的 imports / variables，重点处理：

- `frontend/src/components/ProjectBubble.js`
- `frontend/src/components/BlockEditor.js`
- `frontend/src/components/AIChat.js`
- `frontend/src/components/KeyframeClipPanel.js`
- `frontend/src/components/MarkdownWithTimestamps.js`

本阶段目标是继续减少 `no-unused-vars`，但不改变业务行为。

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
10. 不要处理 `Studio.js`、`VideoPlayer.js`、`StudioWorkSpace.js` 中的 unused warning；这些留给后续批次。

## 允许修改的文件

只允许修改：

- `frontend/src/components/ProjectBubble.js`
- `frontend/src/components/BlockEditor.js`
- `frontend/src/components/AIChat.js`
- `frontend/src/components/KeyframeClipPanel.js`
- `frontend/src/components/MarkdownWithTimestamps.js`
- `tasks/reports/2026-04-25-stage-3g-unused-vars-batch-2.md`

如果 build 输出显示目标 warning 行号变化，可以在这些文件内处理同类 warning。不要扩大到其他文件。

## 预期清理项

### 1. `ProjectBubble.js`

优先清理：

- 未使用 lucide icon imports
- `newProject`
- `handleDeleteProject`
- `handleDragStart`

要求：

- 删除前确认这些函数/变量没有被 JSX 或其他函数引用。
- 如果删除函数会影响未来功能但当前完全未使用，可以删除；报告中记录。

### 2. `BlockEditor.js`

优先清理：

- 未使用 lucide icon imports
- 未使用的 `MarkdownParser`
- `isDragging`

要求：

- 只删除 build 明确报 unused 的 import/变量。
- 不改拖拽逻辑。
- 不改 block 解析/编辑行为。

### 3. `AIChat.js`

目标：

- `dragCounter`

要求：

- 先确认 `dragCounter` 是否只被声明未使用。
- 如果相关 drag enter/leave 逻辑依赖它但未完成，不要大改拖拽逻辑；只删除完全无用的 state/ref。

### 4. `KeyframeClipPanel.js`

目标：

- `timelineRef`

要求：

- 先确认 `timelineRef` 没有被 JSX ref 或逻辑引用。
- 只删除 ref 声明，不改关键帧逻辑。

### 5. `MarkdownWithTimestamps.js`

目标：

- `lastClickedTimestamp`

要求：

- 先确认它没有被读取。
- 如果只是被 set 但不读，删除 state 和 set 调用。
- 不改 timestamp click 行为。

## 修复策略

### imports

- 删除未使用 import specifier。
- 保持 import 顺序大体不变。
- 不做格式化大改。

### unused state / refs / callbacks

- 如果 state 值和 setter 都不影响 UI，删除整组 state。
- 如果只有 setter 未使用，保留 value 或改为单元素 destructuring。
- 如果变量赋值表达式有副作用，不要删除表达式；先报告。

## 验证要求

必须运行：

```bash
cd frontend
npm run build
```

验收目标：

- build 成功
- 本阶段目标文件中的目标 `no-unused-vars` warning 消失或明显减少
- 不新增 warning
- 不新增 hooks warning
- 不新增 Sidebar/navigation warning

如果出现行为相关风险或 build 失败：

- 只修本阶段范围内的问题。
- 如果问题超出范围，停止并报告主控。

## 报告要求

将报告写入：

`tasks/reports/2026-04-25-stage-3g-unused-vars-batch-2.md`

报告必须包含：

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
- 修改了哪些文件
- `npm run build` 是否成功
- 清理了多少条 `no-unused-vars`
- 是否新增 warning
- 当前 `git status --short --untracked-files=all`
- 明确没有 commit/push

