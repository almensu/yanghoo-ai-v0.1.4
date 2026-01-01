## 不变项与目标
- 后端契约保持不变：沿用现有 REST `/api/chat` 与 WebSocket `wsBaseUrl/ws`。
- 目标：移除 `AIChat.js` 的直接 DOM 操作，采用受控 React 组件与 Hook；抽象任务页 WebSocket 管理成可复用 Hook。

## 现状锚点（将被替换）
- 直接 DOM：`frontend/src/components/AIChat.js:485–543`（createThinkingBlock）、`546–599/629–670/1032/1041`（processThinking 插入）。
- 流式占位→增量→最终替换：`AIChat.js:612–669/672–689`。
- 请求与响应：`AIChat.js:809–839`（payload/响应字段）。
- 任务页 WebSocket：`frontend/src/pages/TaskListPage.js:100–148`。

## 新增文件与目录（仅前端）
- `src/features/chat/components/MessageList.jsx`：受控渲染消息列表（含滚动管理）。
- `src/features/chat/components/ThinkingBlock.jsx`：渲染 `<think>` 解析片段（样式沿用 `thinking-block mb-3 p-3` 等）。
- `src/features/chat/components/ChatInput.jsx`：输入与发送。
- `src/features/chat/components/ModelSelector.jsx`：模型与参数选择。
- `src/features/chat/components/ContextPicker.jsx`：文档上下文选择与汇总。
- `src/features/chat/hooks/useChatStream.js`：统一占位→流式增量→最终替换，复用现有 payload/响应字段。
- `src/features/chat/utils/parseThinking.js`：纯函数解析 `<think>`，返回 `{ thinkingSegments, reply }`。
- `src/services/ws.js`：WebSocket 连接、重连、心跳、消息派发。
- `src/features/tasks/hooks/useTaskUpdates.js`：订阅 WS，处理 `task_update` 合并与未知 `uuid` 降级（调用 `fetchTasks()`）。

## 迁移步骤与具体改造
1) 引入 `parseThinking`：将 `processThinking` 的逻辑改为纯解析，不产生/操作 DOM。
2) 创建 `MessageList/ThinkingBlock`：
   - `MessageList` 接收 `messages`，对含 `thinkingSegments/reply` 的消息渲染多个 `ThinkingBlock` 与最终回复。
   - 内部使用 `ref` + `useEffect` 管理“滚动到底部”，替代对 `chatContainerRef` 的手动写入（参考 `AIChat.js:475`）。
3) 创建 `useChatStream`：
   - 输入：`apiBaseUrl, selectedModel, currentMessages, contextDocument`。
   - 行为：按照现有 `AIChat.js:612–669/672–689/809–839` 的节奏进行占位消息插入、逐字符/逐片段累积（`chunkSize/delay` 可参数化）、调用 `parseThinking` 更新状态、最终合并。
   - 输出：`messages, isStreaming, currentStreamedContent, debugInfo, rawResponse, sendMessage`。
4) 改造 `AIChat.js` 为容器组件：
   - 保留现有状态（模型选择、上下文汇总、调试信息）。
   - 移除 `createThinkingBlock/processThinking` 的 DOM 路径，全部通过 `useChatStream` + `MessageList/ThinkingBlock` 渲染。
   - 通知与错误提示统一用现有 `Toast`（与任务页一致）。
5) WebSocket 抽象：
   - `ws.js`：`createWS(url, { onOpen, onClose, onError, onMessage }, { heartbeatMs, retryBackoff })`。
   - `useTaskUpdates(wsBaseUrl, { onTaskUpdate, onUnknownTask })`：内部解析 `message.type==='task_update'` 并合并到页面 `tasks`；未知 `uuid` 触发 `fetchTasks()` 逻辑（与现状一致）。
   - `TaskListPage` 接入 Hook，替换内联 `new WebSocket` 与事件绑定，继续使用 `Toast` 提示失败/状态。

## 验收标准
- Chat：流式展示与 `<think>` 内容一致；无直接 DOM 操作；错误与加载状态统一；最终消息与当前实现等价。
- 任务页：WS 更新稳定；重连后状态恢复；未知 `uuid` 降级有效；任务操作（删除/归档/恢复等）不受影响。

## 测试计划
- `parseThinking`：多段/嵌套/无标签/边界输入用例。
- `useChatStream`：axios mock 成功/空响应/错误分支；验证占位→增量→最终替换与 `debugInfo`。
- `ws.js/useTaskUpdates`：WS mock 验证消息派发、重连与心跳、未知 `uuid` 降级。
- 组件测试（RTL）：`MessageList/ThinkingBlock` 渲染与滚动、`ChatInput` 触发发送。

## 风险与回退
- 渐进式替换：保留旧逻辑入口，分阶段切换子组件/Hook；若出现异常，快速回退到旧路径。
- 不引入新库：使用现有 React/Tailwind/DaisyUI，降低复杂度与风险。

## 时间排期
- Chat 拆分：1–2 天；WS 抽象：0.5–1 天；测试与回归：0.5 天。