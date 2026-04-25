# 阶段 3J 执行报告：React hooks warning 审计

执行日期：2026-04-25
执行者：Claude (glm)

## 执行前检查

- `git status`: 工作区干净（仅 `tasks/2026-04-25-stage-3j-hooks-warning-audit.md` untracked）
- `git log -3`: `3b4a611` docs: 3I 报告, `90b7617` refactor: 3I 清理, `0730d4f` docs: 3H 报告
- 确认可开始 3J（只读审计，不改代码）

## 构建结果

- `npm run build`: **成功**
- 总 warning: **12 条**（全部为 `react-hooks/exhaustive-deps`）
- 与 3I 结束时一致，无变化
- master 复核 build 成功，确认当前剩余 hooks warning 为 12 条，未发现新的 `no-unused-vars`

## hooks warning 列表

| # | 文件 | 行号 | Warning 文案 | 依赖数组现状 |
|---|------|------|-------------|-------------|
| 1 | AIChat.js | 135 | missing dep `fetchMarkdownFiles` | `[taskUuid, apiBaseUrl]` |
| 2 | BlockEditor.js | 51 | missing dep `updateBlocks` | `[markdownContent]` |
| 3 | MarkdownWithTimestamps.js | 376 | missing dep `handleTimestampClick`; `placeholderMapRef.current` not valid dep | `[processedContent, timestampClassName, placeholderMapRef.current]` |
| 4 | Studio.js | 23 | missing dep `fetchTasks`（VideoTaskSelector 内） | `[isOpen]` |
| 5 | Studio.js | 1171 | missing dep `displayLang` | `[taskUuid, apiBaseUrl]` |
| 6 | Studio.js | 1256 | missing dep `optimizeSubtitleTiming` | `[parsedCuesByLang, displayLang, availableLangs, subtitleOptimization]` |
| 7 | Studio.js | 1653 | missing dep `taskDetails.ass_files` | `[selectedCueIds, displayedCues, taskUuid, ...]` |
| 8 | StudioWorkSpace.js | 212 | missing deps `markdownContent`, `selectedFile` | `[taskUuid, apiBaseUrl]` |
| 9 | StudioWorkSpace.js | 217 | missing dep `fetchDocFiles` | `[taskUuid, apiBaseUrl]` |
| 10 | VideoPlayer.js | 1136 | missing dep `initializeYouTubePlayer` | `[shouldShowLocal, embedVideoAvailable]` |
| 11 | VideoPlayer.js | 1204 | missing dep `initializeYouTubePlayer` | `[shouldShowLocal, embedVideoAvailable, formattedEmbedUrl]` |
| 12 | VttPreviewer.js | 178 | unnecessary dep `videoRef.current` | `[videoRef, videoRef?.current, ...]` |

## 逐条分析

### #1 AIChat.js:135 — fetchMarkdownFiles

```js
useEffect(() => {
  if (taskUuid && apiBaseUrl) {
    fetchMarkdownFiles();
  }
}, [taskUuid, apiBaseUrl]);
```

**分析**: `fetchMarkdownFiles` 是组件内的 async 函数（line 160），读取 `taskUuid` 和 `apiBaseUrl`。当前行为：仅当 taskUuid/apiBaseUrl 变化时重新拉取，`fetchMarkdownFiles` 内的闭包捕获初始值。由于 `fetchMarkdownFiles` 内直接引用的是 `taskUuid`/`apiBaseUrl`（与 dep array 一致），实际不会产生 bug。

**推荐**: 将 `fetchMarkdownFiles` 包进 `useCallback` 并加入依赖。或者将 fetch 逻辑内联到 useEffect 中。

**风险**: P0 — 函数内如果后续引用其他 state，闭包将捕获旧值。

---

### #2 BlockEditor.js:51 — updateBlocks

```js
useEffect(() => {
  try {
    const manager = new BlockManager();
    if (markdownContent) {
      manager.loadFromMarkdown(markdownContent);
    }
    setBlockManager(manager);
    updateBlocks(manager);  // line 47
  } catch (error) {
    console.error('Failed to initialize BlockManager:', error);
  }
}, [markdownContent]);
```

**分析**: `updateBlocks`（line 53）读取 `blockManager` state，但此处是直接传入 `manager` 参数调用，不依赖 state。当前行为正确。

**推荐**: 将 `updateBlocks` 逻辑内联（`setBlocks([...manager.getAllBlocks()])`），消除 warning。

**风险**: P1 — 当前实际无 bug（传参调用而非读 state），但 eslint 无法区分。

---

### #3 MarkdownWithTimestamps.js:376 — handleTimestampClick / placeholderMapRef.current

```js
}, [processedContent, timestampClassName, placeholderMapRef.current]);
```

**分析**: 
1. `handleTimestampClick` 作为事件处理函数，在 handleClick 内通过 `handleTimestampClickRef.current` 调用（ref 模式）。eslint 要求加入依赖，但 ref 模式正是为了避免 effect 重执行。
2. `placeholderMapRef.current` 是 mutable ref value，不应该是依赖。

**推荐**: 
- 保留 `handleTimestampClick` 不加入依赖（已通过 ref 模式处理）
- 移除 `placeholderMapRef.current`，改为 `placeholderMapRef`（或 eslint-disable）
- 加 `eslint-disable-next-line` 注释说明意图

**风险**: P1 — 需要小心处理，不能简单加依赖

---

### #4 Studio.js:23 — fetchTasks（VideoTaskSelector）

```js
useEffect(() => {
  if (isOpen) {
    fetchTasks();
  }
}, [isOpen]);
```

**分析**: `fetchTasks` 读取 `apiBaseUrl`（prop，不变），当前行为正确。但若 `apiBaseUrl` 运行时变化（切换环境），不会重新拉取。

**推荐**: 将 `fetchTasks` 包进 `useCallback` 依赖 `apiBaseUrl`，或加入 `apiBaseUrl` 到 effect dep array。

**风险**: P0 — 若 apiBaseUrl 动态变化会导致数据不刷新。

---

### #5 Studio.js:1171 — displayLang

```js
}, [taskUuid, apiBaseUrl]); // Remove displayLang dependency
```

**分析**: 这是一个大型 fetchData effect（约 200 行），获取 VTT/SRT 文件并解析。`displayLang` 被有意排除——注释明确说明 "Remove displayLang dependency"。原因是切换语言不应重新拉取全部数据，而是由另一个独立 effect（line 1174-1256）处理 VTT blob URL 生成。

**推荐**: 保留现状，加 `eslint-disable-next-line` 注释说明设计意图。

**风险**: P2 — 有意排除，有独立 effect 补偿。

---

### #6 Studio.js:1256 — optimizeSubtitleTiming

```js
}, [parsedCuesByLang, displayLang, availableLangs, subtitleOptimization]);
```

**分析**: `optimizeSubtitleTiming` 是 `useCallback` 函数（line 1259），依赖 `subtitleOptimization`。effect 依赖数组已包含 `subtitleOptimization`，但缺少 `optimizeSubtitleTiming` 函数本身。由于 `optimizeSubtitleTiming` 只读 `subtitleOptimization`（已在 dep 中），实际无闭包 bug。

**推荐**: 将 `optimizeSubtitleTiming` 加入 dep array（它已是 useCallback，引用稳定）。

**风险**: P1 — 当前安全但不符合 eslint 规范。

---

### #7 Studio.js:1653 — taskDetails.ass_files

```js
}, [selectedCueIds, displayedCues, taskUuid, videoRelativePath, apiBaseUrl, cuttingStatus, pollCutStatus, vttMode, displayLang, parsedCuesByLang, outputFormat]);
```

**分析**: 这是一个 `useCallback`（handleSendCutRequest），内部读取 `taskDetails.ass_files`。`taskDetails` 是 state，`ass_files` 是其属性。当前不包含在 dep 中意味着：如果 `ass_files` 在组件生命周期中变化，callback 将使用旧值。

**推荐**: 将 `taskDetails?.ass_files` 加入 dep array。

**风险**: P0 — ass_files 变化时 callback 闭包捕获旧值，可能导致剪辑请求使用过时的字幕文件路径。

---

### #8 StudioWorkSpace.js:212 — markdownContent / selectedFile

```js
}, [taskUuid, apiBaseUrl]); // Simpler dependencies
```

**分析**: effect 内部 `fetchFileList` 函数（line 159）读取 `markdownContent`（line 177）和 `selectedFile`（line 191）。注释说明有意排除以避免不必要重执行。但：
- `markdownContent` 用于决定是否自动选择默认文件
- `selectedFile` 用于条件判断

**推荐**: 
- 将 `markdownContent` 加入 dep（或用 ref 存最新值）
- `selectedFile` 用 ref 存最新值避免循环
- 或者将判断逻辑移到 effect 外部

**风险**: P0 — 如果 prop `markdownContent` 在初始渲染后变化，不会触发文件列表重新加载逻辑。

---

### #9 StudioWorkSpace.js:217 — fetchDocFiles

```js
useEffect(() => {
  fetchDocFiles();
}, [taskUuid, apiBaseUrl]);
```

**分析**: `fetchDocFiles` 是组件内的 async 函数，读取 `taskUuid` 和 `apiBaseUrl`。与 #1 同类问题。

**推荐**: 将 `fetchDocFiles` 包进 `useCallback` 或内联到 effect。

**风险**: P0 — 与 #1 相同模式，闭包风险。

---

### #10 VideoPlayer.js:1136 — initializeYouTubePlayer（effect 1）

```js
}, [shouldShowLocal, embedVideoAvailable]);
```

**分析**: effect 内部定义 `onYouTubeIframeAPIReady` 回调（line 1106），在 API 就绪后调用 `initializeYouTubePlayer()`。`initializeYouTubePlayer` 读取 DOM 和 window.YT，不依赖 state。

**推荐**: 将 `initializeYouTubePlayer` 包进 `useCallback`（无额外 dep），加入 effect dep array。

**风险**: P0 — YouTube 播放器初始化可能使用旧闭包。

---

### #11 VideoPlayer.js:1204 — initializeYouTubePlayer（effect 2）

```js
}, [shouldShowLocal, embedVideoAvailable, formattedEmbedUrl]);
```

**分析**: 另一个 YouTube 相关 effect，添加 iframe load 事件监听器，事件回调内调用 `initializeYouTubePlayer()`。与 #10 同类。

**推荐**: 同 #10。

**风险**: P0 — 与 #10 相同。

---

### #12 VttPreviewer.js:178 — videoRef.current

```js
}, [videoRef, videoRef?.current, handleTimeUpdateThrottled, timeUpdateLogic]);
```

**分析**: `videoRef.current` 是 mutable ref value，不应作为依赖。它的变化不会触发重渲染。但此处 effect 确实需要在 video 元素挂载后运行。

**推荐**: 移除 `videoRef?.current`，保留 `videoRef`。如果 effect 需要在 video 元素变化时重运行，应使用 state 或 callback ref 模式。或者加 `eslint-disable-next-line` 注释。

**风险**: P3 — eslint 无法表达 "我需要 ref.current 的当前值但不想订阅变化" 的意图。

## 风险分级

### P0 真 bug 风险（7 条 warning，6 个独立问题组）

| # | Warning | 风险说明 |
|---|---------|---------|
| 1 | AIChat.js fetchMarkdownFiles | 函数内闭包若后续引用其他 state 将捕获旧值 |
| 4 | Studio.js fetchTasks | apiBaseUrl 动态变化时不会重新拉取 |
| 7 | Studio.js taskDetails.ass_files | ass_files 变化时剪辑请求可能使用旧路径 |
| 8 | StudioWorkSpace.js markdownContent/selectedFile | prop 变化不触发文件列表重新加载 |
| 9 | StudioWorkSpace.js fetchDocFiles | 与 #1 同模式，闭包风险 |
| 10 | VideoPlayer.js initializeYouTubePlayer (1) | YT 播放器初始化可能用旧闭包 |
| 11 | VideoPlayer.js initializeYouTubePlayer (2) | 与 #10 同 |

**注**: #10 和 #11 是同一个 `initializeYouTubePlayer` 稳定化问题在两个不同 effect 中出现，因此表格是 7 条 warning，但归并为 6 个独立问题组。

### P1 应修复（4 条）

| # | Warning | 修复难度 |
|---|---------|---------|
| 2 | BlockEditor.js updateBlocks | 低（内联即可） |
| 3 | MarkdownWithTimestamps.js handleTimestampClick | 中（涉及 ref 模式） |
| 6 | Studio.js optimizeSubtitleTiming | 低（加入 dep） |
| — | — | — |

### P2 可暂缓（1 条）

| # | Warning | 说明 |
|---|---------|---------|
| 5 | Studio.js displayLang | 有意排除，有独立 effect 补偿 |

### P3 建议保留并注释（1 条）

| # | Warning | 说明 |
|---|---------|---------|
| 12 | VttPreviewer.js videoRef.current | ref.current 无法作为有效依赖，eslint-disable |

## 推荐修复顺序

### 第一优先级（P0，低修复风险）

1. **#9 StudioWorkSpace.js:217 fetchDocFiles** — 包进 useCallback 或内联，最简单
2. **#1 AIChat.js:135 fetchMarkdownFiles** — 同模式
3. **#4 Studio.js:23 fetchTasks** — 包进 useCallback
4. **#7 Studio.js:1653 taskDetails.ass_files** — 加入 dep array

### 第二优先级（P0，需回归测试）

5. **#10/#11 VideoPlayer.js initializeYouTubePlayer** — 两处同时修，需浏览器验证 YT 播放器初始化
6. **#8 StudioWorkSpace.js:212 markdownContent/selectedFile** — 需仔细处理避免无限循环

### 第三优先级（P1）

7. **#2 BlockEditor.js:51 updateBlocks** — 内联即可
8. **#6 Studio.js:1256 optimizeSubtitleTiming** — 加入 dep

### 第四优先级（P1/P3，需斟酌）

9. **#3 MarkdownWithTimestamps.js:376** — 涉及 ref 模式，不宜简单加 dep
10. **#12 VttPreviewer.js:178** — eslint-disable + 注释

## 阶段 3K 建议

3K 应修复 **10 条**（P0 6 + P1 4），保留 2 条：

### 建议分批

**3K-A（低风险，4 条）**: #1, #2, #4, #9
- 模式统一：async 函数包进 useCallback 或内联到 effect
- 不需要浏览器验收，build 通过即可

**3K-B（中风险，4 条）**: #6, #7, #10, #11
- #6/#7 简单加 dep
- #10/#11 YouTube 播放器需浏览器验证
- 建议修改后手动测试视频播放

**3K-C（需斟酌，2 条）**: #3, #8
- #3 涉及 ref + event listener 模式
- #8 涉及 state 循环依赖，可能需要 useRef 或重写逻辑
- 需要仔细设计

## 不建议立即修的项

| # | Warning | 原因 |
|---|---------|--------|
| 5 | Studio.js displayLang | 有意排除，有独立 effect（line 1174）补偿；加 dep 会导致 fetchData 重新拉取全部数据，影响性能 |
| 12 | VttPreviewer.js videoRef.current | ref.current 是 mutable value，eslint 无法表达 "读取但不订阅" 的意图；加 eslint-disable + 注释是最佳选择 |

## 最终 git status

```
?? tasks/2026-04-25-stage-3j-hooks-warning-audit.md
?? tasks/reports/2026-04-25-stage-3j-hooks-warning-audit.md
```

工作区干净，无前端代码修改。
