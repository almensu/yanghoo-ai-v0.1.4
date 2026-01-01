## 目标与范围
- 后端保持不变：沿用现有 REST `/api/chat` 与 WebSocket `wsBaseUrl/ws` 契约。
- 本次交付两块：
  1) Chat 模块拆分与受控渲染（替换直接 DOM 操作）
  2) 任务页 WebSocket 抽象与 Hook 化

## 代码现状与锚点
- Chat 直接 DOM 操作：
  - `chatContainerRef`：`frontend/src/components/AIChat.js:83/475/1546`
  - `thinkingBlocksRef` / `thinkingContainerRef`：`frontend/src/components/AIChat.js:100–101/550–552/569/578–579`
  - 创建思考块：`createThinkingBlock`：`frontend/src/components/AIChat.js:485–543`
  - 解析与插入思考块：`processThinking`：`frontend/src/components/AIChat.js:546–599/629–670/1032/1041`
  - 流式渲染：`frontend/src/components/AIChat.js:612–669/672–689`
  - 请求与响应处理：`frontend/src/components/AIChat.js:809–839/826–839`
- WebSocket 任务更新：`frontend/src/pages/TaskListPage.js:100–148`

## 方案 1：Chat 模块拆分与受控渲染
- 新增目录与文件（保持 JS，不引入新库）：
  - `src/features/chat/components/MessageList.jsx`：渲染消息列表，内部管理滚动（替代对 `chatContainerRef` 的直接赋值与滚动高度写入）。
  - `src/features/chat/components/ThinkingBlock.jsx`：接收解析后的思考段数组，使用 Tailwind/DaisyUI 类进行受控渲染，样式对齐 `createThinkingBlock`（如 `thinking-block mb-3 p-3 rounded-lg border text-gray-600 text-sm`）。
  - `src/features/chat/components/ChatInput.jsx`：输入与发送交互。
  - `src/features/chat/components/ModelSelector.jsx`、`ContextPicker.jsx`：沿用现有选择与上下文汇总逻辑（不改接口）。
  - `src/features/chat/hooks/useChatStream.js`：封装聊天发送与流式增量更新，输出：
    - 状态：`isStreaming/currentStreamedContent/messages/debugInfo/rawResponse`
    - 方法：`sendMessage(payload)` 保持原负载结构与占位消息→增量→最终替换的过程。
- 渲染与解析改造：
  - 将 `processThinking(content, msgId)` 改为纯函数 `parseThinking(content)` 返回 `{thinkingSegments: string[], reply: string}`。
  - 流式过程中在 Hook 里对 `accumulatedContent` 调用 `parseThinking`，更新 MessageList 的消息状态（不创建/追加 DOM 节点）。
  - MessageList 根据消息对象中的 `thinkingSegments/reply` 渲染多个 `ThinkingBlock` 与最终回复文本。
- 兼容与过渡：
  - `AIChat` 先作为容器组件使用上述子组件与 Hook，保留原有 `payload` 拼装与响应字段访问（`model_used/content`）。
  - 临时保留旧方法与引用，分段替换，保障回退快速可行。
- 验收：
  - 保持原有交互：占位消息出现→流式增量→最终合并，`<think>` 标签的内容与最终回复均正确显示。
  - 移除直接 DOM 操作，滚动行为稳定；错误与调试信息保留。

## 方案 2：WebSocket 抽象与 Hook 化（任务页）
- 新增文件：
  - `src/services/ws.js`：管理连接、重连、心跳、关闭与消息分发；对 `wsBaseUrl` 拼接 `'/ws'`。
  - `src/features/tasks/hooks/useTaskUpdates.js`：注册消息监听，解析 `task_update` 并合并至 `tasks`；若收到未知 `uuid`，调用传入的 `fetchTasks()` 兼容更新（保留现有降级逻辑）。
- 页面改造：
  - `TaskListPage` 使用 `useTaskUpdates(wsBaseUrl, onUpdate, onError)`；用现有 `Toast` 替代原有 `alert`。
- 验收：
  - 连接与重连稳定；`task_update` 生效与降级无回归；通知统一。

## 测试与验证
- 单元测试：
  - `useChatStream`：模拟 axios，覆盖成功、空响应、错误分支（保留 `debugInfo` 行为）。
  - `ws.js/useTaskUpdates`：模拟 WebSocket，覆盖消息解析、重连与未知 `uuid` 降级。
- 组件测试（RTL）：
  - `MessageList/ThinkingBlock`：验证 `<think>` 内容渲染、滚动管理。
- 手动验证：
  - 路由：`/` 与 `/studio/:taskUuid`
  - Chat：发送与流式行为；任务页：删除/归档/恢复与 WS 更新。

## 时间与风险
- Chat 拆分：约 1–2 天；WS 抽象：约 0.5–1 天。
- 风险控制：分阶段提交与构建；保留旧路径便于快速回退。