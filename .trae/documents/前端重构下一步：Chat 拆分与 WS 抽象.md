## 目标与不变项
- 保持后端接口与协议不变：沿用现有 REST 与 WebSocket 契约（如 `/api/chat`、`wsBaseUrl/ws`）。
- 聚焦前端结构与交互合理化：拆分超大组件、移除直接 DOM 操作、统一状态与错误处理。

## 改造范围概览
- Chat 模块：`frontend/src/components/AIChat.js`（思考块、流式渲染、上下文文档汇总与请求拼装）。
- 任务页 WebSocket：`frontend/src/pages/TaskListPage.js:100–148`（连接与消息处理）。

## 第 3 期：AIChat 组件拆分与流式渲染改造
- 现状问题点与代码参考：
  - 直接 DOM 操作思考块：`AIChat.js:485–543`（createThinkingBlock）、`AIChat.js:546–599/629–670/1027–1067`（processThinking 调用与操作）。
  - 流式渲染与占位消息：`AIChat.js:612–669/672–689`。
  - 请求 payload 构造与响应处理：`AIChat.js:809–839/826–839`。
- 目标：移除直接 DOM 操作，改为受控 React 渲染；将请求与流式逻辑抽到 Hook；UI 子组件化。
- 目录与文件（仅前端新增，接口不变）：
  - `src/features/chat/components/MessageList.jsx`：渲染消息、维护滚动（替代 `scrollToBottom` 与容器直接操作）。
  - `src/features/chat/components/ChatInput.jsx`：输入框、发送事件。
  - `src/features/chat/components/ModelSelector.jsx`：模型选择与参数。
  - `src/features/chat/components/ContextPicker.jsx`：文档上下文选择与内容汇总（参考现有提及与合并逻辑）。
  - `src/features/chat/components/ThinkingBlock.jsx`：解析 `<think>...</think>`，用 React 受控渲染替代 `createThinkingBlock/processThinking`。
  - `src/features/chat/hooks/useChatStream.js`：封装消息发送、占位→流式→最终替换流程，复用现有 payload 与响应处理。
- 重构策略：
  - 在不改动 API 的前提下，将 `AIChat` 改为组装上述子组件与 Hook 的“容器组件”。
  - 保留当前的消息数据结构（包含占位、回复与思考块解析结果），仅改变渲染实现。
  - 现有的调试信息与错误信息（`setDebugInfo` 等）在 Hook 中统一产出。
- 验收：
  - 聊天行为一致：消息发送、流式展示、思考块内容与最终消息一致（不丢失 `<think>` 部分）。
  - 无直接 DOM 操作，滚动与渲染稳定。

## 第 4 期：WebSocket 管理抽象（任务页）
- 现状与参考：WS 初始化与消息处理位于 `TaskListPage.js:100–148`，包含 `task_update` 合并与失败通知（目前用 `alert`）。
- 目标：抽出 WS 管理与订阅 Hook，增强重连与心跳，统一错误与通知，页面只做订阅消费。
- 目录与文件：
  - `src/services/ws.js`：封装连接（`new WebSocket(`${wsBaseUrl}/ws`)`）、重连策略、心跳、消息派发。
  - `src/features/tasks/hooks/useTaskUpdates.js`：订阅 WS，处理 `task_update`（`type/uuid/task_data/status`），按现有策略合并至 `tasks`，当收到未知 `uuid` 时触发 `fetchTasks()`（保留原兼容逻辑）。
- 页面改造：
  - `TaskListPage` 使用 `useTaskUpdates` 注册回调与清理，移除内联 `onmessage/onopen/onclose`。
  - 通知统一使用现有 `Toast` 而非 `alert`（保持上一阶段的统一风格）。
- 验收：
  - 任务列表能即时更新；重连后状态正确；错误信息统一显示；无回归（删除、归档、恢复等操作不受影响）。

## 测试与验证
- 单测：
  - `useChatStream` 使用 axios mock 验证占位→流式→最终替换流程与错误分支。
  - `ws.js/useTaskUpdates` 使用 WebSocket mock 验证消息派发与重连策略。
- 组件测试（RTL）：
  - `MessageList` 渲染与滚动行为。
  - `ThinkingBlock` 对 `<think>` 解析与显示。
- 构建与手测：每阶段完成后执行构建，进入 `/` 与 `/studio/:taskUuid` 回归关键路径。

## 风险控制与回退
- 渐进迁移：`AIChat` 保持导出不变，先引入子组件与 Hook，阶段性替换内部实现；出现问题可暂时切回旧渲染路径。
- `TaskListPage` 在启用 `useTaskUpdates` 前保留旧 WS 逻辑，可通过开关快速回退。

## 时间排期（建议）
- P3（Chat 拆分）：1–2 天（组件与 Hook、联调与测试）。
- P4（WS 抽象）：0.5–1 天（服务与 Hook、页面接入、测试）。

## 交付标准
- 无后端改动，所有接口调用与路由行为保持一致。
- Chat 模块组件化、无直接 DOM 操作；WS 管理统一抽象与通知一致。