## 目标与边界
- 保持后端 REST/WebSocket 契约不变。
- 仅重构前端 Chat，聚焦可维护性与稳定性；复用现有服务层、Toast、WS 抽象。

## 拆分与文件变更（尽量少新增）
- 编辑：`frontend/src/components/AIChat.js`（改用 Hook 与子组件，移除内部流控和零散渲染）。
- 新增（必要）：
  - `frontend/src/features/chat/hooks/useChatStream.js`（统一流式发送与增量合并）。
  - `frontend/src/features/chat/components/MessageList.jsx`（展示消息列表，纯展示）。
  - `frontend/src/features/chat/components/ThinkingBlock.jsx`（展示 `<think>` 解析结果，纯展示）。
  - `frontend/src/features/chat/components/ChatInput.jsx`（受控输入与发送按钮）。

## Hook 设计：`useChatStream`
- 输入：`sendMessage(content, options)`，`options` 支持模型、上下文、温度等现有入参（与当前 AIChat 一致）。
- 输出：`messages`、`isStreaming`、`currentDelta`、`error`、`reset()`；事件回调：`onDelta`、`onFinish`（可选）。
- 行为：
  - 发送时插入占位消息→接收流增量→最终合并为稳定 `reply`；
  - 使用现有 `parseThinking(content)` 去除 `<think>` 并保留展示块；
  - 统一错误处理并通过 `Toast` 提示。

## 子组件职责
- `MessageList`：按消息对象渲染，复用现有样式类，避免逻辑。
- `ThinkingBlock`：接收 `thinkingSegments`，渲染暗色卡片与可折叠（如需）。
- `ChatInput`：受控输入、快捷键发送、禁用态处理（`isStreaming`）。

## 状态与数据流
- `AIChat` 持有：模型选择、上下文、会话消息；调用 `useChatStream` 完成流控。
- `MessageList` 与 `ThinkingBlock` 仅消费数据；`ChatInput` 触发 `sendMessage`。

## 错误态与体验
- 统一走 `Toast`：网络失败、超时、内容为空、模型未选。
- 流程守卫：发送防抖、重复发送拦截、超长消息截断提示（不改后端）。

## 迁移步骤
1. 实现 `useChatStream`（先以现有 AIChat 逻辑为基线）。
2. 改造 `AIChat.js`：用 Hook 替代内部流式循环与合并；保留现有 props/接口。
3. 拆出 `MessageList`/`ThinkingBlock`/`ChatInput`，迁移渲染；删除重复代码。
4. 联调：发送、增量、思考块、错误态；手测快捷键与禁用态。

## 验收标准
- 流式渲染稳定：增量平滑、最终合并正确；思考块展示一致。
- 无回归：历史消息保留、模型与上下文选择行为不变。
- 错误提示：可复现的失败场景均弹出友好 Toast。

## 风险与回滚
- 若出现不可控回归，保留旧渲染路径一次提交可回滚；新增文件均独立、删除前保留备份。

## 时间与交付
- 预估 1 次迭代完成：实现+联调+自测；提交后进入阶段6测试与告警清理。