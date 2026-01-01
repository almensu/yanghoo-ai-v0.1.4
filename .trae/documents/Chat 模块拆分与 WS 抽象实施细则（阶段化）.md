## 目标
- 后端保持不变：沿用现有 REST `/api/chat` 与 WebSocket `wsBaseUrl/ws` 契约。
- 前端更合理：移除直接 DOM 操作，模块化组件与逻辑，统一错误/加载提示。

## 现状锚点
- 直接 DOM 操作：`frontend/src/components/AIChat.js:485–543`（createThinkingBlock），`546–599/629–670/1032/1041`（processThinking 使用）。
- 流式渲染占位→增量→最终替换：`AIChat.js:612–669/672–689`。
- 请求与响应处理：`AIChat.js:809–839`。
- 任务页 WS：`frontend/src/pages/TaskListPage.js:100–148`。

## 文件结构（新增，不改接口）
- `src/features/chat/components/MessageList.jsx`：受控渲染消息列表与思考块，管理滚动。
- `src/features/chat/components/ThinkingBlock.jsx`：渲染 `<think>` 解析结果，样式沿用现有类（如 `thinking-block mb-3 p-3`）。
- `src/features/chat/components/ChatInput.jsx`、`ModelSelector.jsx`、`ContextPicker.jsx`：输入/模型/上下文选择区。
- `src/features/chat/hooks/useChatStream.js`：封装占位→流式→最终替换，保持 `/api/chat` payload 与响应字段（`content/model_used`）。
- `src/services/ws.js`：封装 WebSocket 连接、重连、心跳、派发。
- `src/features/tasks/hooks/useTaskUpdates.js`：订阅 `task_update`，合并状态；未知 `uuid` 时触发 `fetchTasks()`。

## 数据与接口设计
- 消息对象：`{ id, role, content, isPlaceholder, thinkingSegments: string[], reply: string }`。
- 解析函数：`parseThinking(content) => { thinkingSegments, reply }`（替代 `processThinking` 的 DOM 路径）。
- `useChatStream(apiBaseUrl, selectedModel)`：
  - 状态：`messages, isStreaming, currentStreamedContent, debugInfo, rawResponse`。
  - 方法：`sendMessage(userText, combinedDocument)`；内部执行占位→流式增量（循环拼接）→最终解析，沿用 `AIChat.js:612–669/648` 流程。
- `ws.js`：`createWS(url, { onOpen, onClose, onError, onMessage, heartbeatInterval, retryBackoff })`。
- `useTaskUpdates(wsBaseUrl, { onUpdate, onUnknownTask })`：封装连接与消息处理，回调驱动页面合并。

## 迁移步骤
1) 在 `AIChat` 引入 `parseThinking` 与 `MessageList`，保持原消息结构，先只替换展示层（不移除旧 DOM 方法）。
2) 实现 `useChatStream`，将占位/增量/最终替换迁入 Hook；`AIChat` 作为容器传递 props 与触发 `sendMessage`。
3) 逐步删除 `createThinkingBlock/processThinking` 的 DOM 依赖，改为 `ThinkingBlock` 受控渲染。
4) 抽出任务页 WS：新增 `ws.js` 与 `useTaskUpdates`，`TaskListPage` 用 Hook 接管消息处理与重连；保留未知 `uuid` 时 `fetchTasks()` 降级策略。
5) 通知统一：继续用现有 `Toast` 替代残留的 `alert`；错误由 Hook 返回并统一展示。

## 测试计划
- `parseThinking` 单测：覆盖多段 `<think>`、无标签、边界输入。
- `useChatStream`：axios mock 成功/空响应/错误分支，验证占位→增量→最终替换与 `debugInfo`。
- `ws.js/useTaskUpdates`：WS mock，测试 `task_update` 合并、未知 `uuid` 降级、重连与心跳。
- 组件测试（RTL）：`MessageList/ThinkingBlock` 渲染与滚动；`ChatInput` 发送触发。

## 验收标准
- 聊天行为一致：消息发送与流式展示与现状一致，思考内容正确显示，无直接 DOM 操作。
- 任务页实时更新稳定：重连后正常恢复；错误与通知统一；删除/归档/恢复不受影响。

## 风险与回退
- 渐进迁移：保留旧实现入口，按组件/Hook 逐段替换；问题时可快速回退。
- 不引入新库：使用现有 React/Tailwind/DaisyUI，降低耦合与风险。

## 时间排期
- Chat 拆分：1–2 天；WS 抽象：0.5–1 天；测试与回归：0.5 天。