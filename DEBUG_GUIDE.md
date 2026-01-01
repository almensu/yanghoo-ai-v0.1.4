# 🔍 调试测试指南 - 完整工作流

## 测试场景：创建任务并追踪

### 准备工作

**打开以下窗口**：
1. **浏览器** - http://localhost:3000/ (主应用)
2. **浏览器开发者工具** - 按 `F12`
3. **tmux 监控** - 在终端运行 `tmux attach -t yanghoo-dev`

---

## 测试步骤

### 第 1 步：观察前端日志（tmux 下窗）

**操作**：进入首页，观察前端编译日志

**预期看到**：
```
⚛️ Frontend :3000
Compiled successfully!
You can now view yanghoo-ai in the browser.
  Local: http://localhost:3000
```

**开发者工具 - Console 标签**：
```
✅ 应用启动完成
✅ 路由: / (TaskListPage)
```

---

### 第 2 步：观察后端日志（tmux 上窗）

**操作**：刷新页面，观察 API 请求

**预期看到**：
```
🔧 Backend :8000
INFO: 127.0.0.1:xxxxx - "GET /api/tasks HTTP/1.1" 200 OK
INFO: 127.0.0.1:xxxxx - "GET /api/projects HTTP/1.1" 200 OK
```

**开发者工具 - Network 标签**：
- 看到 `tasks` 和 `projects` 请求
- 状态码：200
- Response 包含任务列表数据

---

### 第 3 步：创建新任务（完整追踪）

**操作**：输入 YouTube URL，点击"创建任务"

**同时观察三个地方**：

#### A. 浏览器 Console
```
[TaskListPage] 创建任务: https://www.youtube.com/watch?v=xxx
[API] POST /api/tasks/ingest
```

#### B. 浏览器 Network
```
POST /api/tasks/ingest
Status: 200 OK
Request: { "url": "https://...", "platform": "youtube" }
Response: { "uuid": "xxx-xxx-xxx", "status": "processing" }
```

#### C. tmux 上窗（后端）
```
🔧 Backend :8000
INFO: POST /api/tasks/ingest
[任务] 创建 ingest 任务: xxx-xxx-xxx
[下载] 开始下载视频...
[转录] 启动 WhisperX...
```

---

### 第 4 步：使用 React DevTools 查看组件状态

**操作**：
1. 按 `F12`，点击 **⚛️ Components** 标签
2. 在左侧组件树找到 `TaskListPage`
3. 点击展开，查看：
   - `props` - 传入的属性
   - `state` - 组件状态（tasks 数组、loading 等）
   - `hooks` - 使用的 hooks

**预期看到**：
```
TaskListPage
  ├─ props: {}
  ├─ state: { tasks: [...], loading: false }
  └─ hooks: useEffect, useState
```

---

### 第 5 步：测试错误处理

**操作**：输入无效的 URL，点击创建

**预期看到**：

#### A. 浏览器 Console (红色错误)
```
❌ Error: Invalid URL
[TaskListPage] 创建失败: URL format error
```

#### B. 浏览器 Network
```
POST /api/tasks/ingest
Status: 400 Bad Request
```

#### C. tmux 上窗
```
🔧 Backend :8000
ERROR: Invalid URL format
INFO: 127.0.0.1:xxxxx - "POST /api/tasks/ingest HTTP/1.1" 400
```

---

## 快速调试命令

### 查看 API 请求（后端日志）
```bash
# 在 tmux 上窗按 Ctrl+C 退出 tail
# 然后运行：
grep "POST\|GET\|PUT\|DELETE" backend.log
```

### 查看错误日志
```bash
# 后端错误
grep -i "error\|exception" backend.log

# 前端错误
grep -i "error\|warning" frontend.log
```

### 查看特定任务日志
```bash
# 假设任务 UUID 是 abc-123
grep "abc-123" backend.log
```

---

## 常见调试场景

### 场景 1：前端页面不更新
**检查点**：
1. Console - 是否有报错？
2. ⚛️ Components - state 是否更新？
3. Network - API 请求是否成功？

### 场景 2：API 请求失败
**检查点**：
1. Network - 状态码是多少？
2. 后端日志 - 服务器是否收到请求？
3. Console - 错误信息是什么？

### 场景 3：WebSocket 消息丢失
**检查点**：
1. Network - WS 标签，连接状态？
2. Console - WebSocket 事件？
3. 后端日志 - 是否广播消息？

---

## 调试工具快捷键

| 工具 | 快捷键 (Mac) | 快捷键 (Windows) |
|------|-------------|------------------|
| 打开开发者工具 | `Cmd+Option+I` | `Ctrl+Shift+I` |
| 打开 Console | `Cmd+Option+J` | `Ctrl+Shift+J` |
| Network 标签 | `Cmd+Shift+I` → Network | `Ctrl+Shift+I` → Network |
| tmux 切换窗格 | `Ctrl+B` → `↑/↓` | `Ctrl+B` → `↑/↓` |
| tmux 滚动 | `Ctrl+B` → `[` | `Ctrl+B` → `[` |

---

## 练习建议

**从简单到复杂**：
1. ✅ 观察页面加载的 API 请求
2. ✅ 创建任务，追踪完整流程
3. ✅ 故意输入错误，观察错误处理
4. ✅ 使用 React DevTools 查看组件状态
5. ✅ 修改代码，添加 console.log，观察输出

**完成后你将掌握**：
- 前端 Console 日志查看
- 后端 API 请求追踪
- React 组件状态调试
- 错误定位和修复

---

**准备好了？打开浏览器，开始测试！** 🚀
