# 阶段 3H 执行报告：unused vars 第三批清理（核心组件）

执行日期：2026-04-25
执行者：Claude (glm)

## 执行前检查

- `git status`: 工作区干净
- `git log -3`: 3G 已提交到 `6a247b1`，已 push
- 确认可开始 3H

## 初始状态

- 分支：`wt-0.2.0`
- 3G 报告记录 40 条 warning（其中 no-unused-vars 28 条）

## 目标 warning

| 文件 | 条数 |
|------|------|
| Studio.js | 8 |
| VideoPlayer.js | 7 |
| **合计** | **15** |

## 实际修改

### 1. Studio.js (8 条)

- 移除 unused imports: `MarkdownViewer`, `MarkdownWithTimestamps`, `TimestampFormatTest`
- `navigate`: 移除 `const navigate = useNavigate()`（Studio 组件内，VideoTaskSelector 内的 navigate 保留）
- `vttErrors`: 值未读取，setter 被使用 → 改为 `const [, setVttErrors] = useState({})`
- `srtFilesToFetch`: 空对象赋值后完全未使用，删除
- `handleSelectTimeRange`: 完整 useCallback 函数无调用点，删除
- `localVideoSrc`: 字符串拼接后完全未使用，删除

### 2. VideoPlayer.js (7 条)

- `setUseAssRenderer`: setter 未使用，值被使用 → 改为 `const [useAssRenderer] = useState(false)`
- `youtubePlayer` / `setYoutubePlayer`: 值和 setter 都未使用（实际用 `youtubePlayerRef`），删除整组 state
- `iframe` (line 326): `document.getElementById` 结果未使用，删除
- `player` (line 327): `new window.YT.Player(...)` 有副作用，保留调用，仅移除变量赋值
- `player` (line 380): 同上模式
- `player` (line 1163): 同上模式

## 行为等价说明

- YouTube Player 构造函数 `new window.YT.Player(...)` 保留所有调用，仅移除变量名（构造函数副作用不变）
- `vttErrors` state 保留（setter 仍被调用），仅跳过 value 解构
- `useNavigate` import 保留（VideoTaskSelector 内仍在使用）
- `navigate` 仅在 Studio 组件内移除，不影响 VideoTaskSelector

## 构建验证

**`npm run build` 成功。**

### 验收检查

| 检查项 | 结果 |
|--------|------|
| build 成功 | pass |
| Studio.js / VideoPlayer.js 的 no-unused-vars 消失 | pass |
| 不新增 warning | pass |
| 不新增 hooks warning | pass |

## warning 变化

| 规则 | 3G | 3H | 变化 |
|------|-----|-----|------|
| `no-unused-vars` | 28 | 13 | **-15** |
| `react-hooks/exhaustive-deps` | 12 | 12 | 不变 |
| **合计** | **40** | **25** | **-15** |

## 未处理 unused vars

| 文件 | 条数 | 说明 |
|------|------|------|
| StudioWorkSpace.js | ~13 | 约束排除，留给后续阶段 |

## 最终 git status

```
 M frontend/src/components/Studio.js
 M frontend/src/components/VideoPlayer.js
?? tasks/reports/2026-04-25-stage-3h-unused-vars-batch-3-core-components.md
```

## 风险和回滚点

| 项 | 说明 |
|----|------|
| 回滚方式 | `git checkout -- frontend/src/components/Studio.js frontend/src/components/VideoPlayer.js` |
| YT Player 构造 | 保留所有 `new window.YT.Player(...)` 调用，仅移除变量名，副作用不变 |
| vttErrors state | setter 仍被调用（3处），state 仍存在但 value 不解构 |
| MarkdownViewer/MarkdownWithTimestamps imports | 当前未使用，若后续启用需重新 import |
| 未 commit/push | 所有变更仅在工作区 |
