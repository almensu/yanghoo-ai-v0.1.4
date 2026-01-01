## 问题与原因
- 现象：在 `Studio` 页的“字幕预览”中点击某个时间戳字幕未实时跳转。
- 根因：字幕项组件在存在选择模式回调时，统一用选择分支处理点击，导致不执行跳转。
  - 单语组件：`frontend/src/components/MonoCueItem.js:18–24`，当 `onCueSelect` 存在时忽略 `onClick`。
  - 双语组件：`frontend/src/components/BilingualCueItem.js:18–24`，同样逻辑。
- 现有跳转实现仅在非选择模式下触发：`frontend/src/components/VttPreviewer.js:183–199`。

## 修复方案（不改后端契约）
1) 为“时间戳”独立绑定跳转点击，且阻止冒泡
- 在 `MonoCueItem` 与 `BilingualCueItem` 的时间戳 `span` 上新增 `onClick={(e) => { e.stopPropagation(); onClick?.(cue.startTime); }}`。
- 效果：即使处于选择模式（剪辑），点击时间戳也会执行跳转；点击字幕文本仍保留选择行为。
- 位置：
  - `frontend/src/components/MonoCueItem.js:57–65`（时间戳 `span`）
  - `frontend/src/components/BilingualCueItem.js:68–76`（时间戳 `span`）

2) 跳转调用统一走播放器方法以兼容 YouTube
- 将 `VttPreviewer` 的 `handleCueClickForSeek` 优化为优先调用 `videoRef.current.seekToTimestamp(startTime)`，无则回退到 `video.currentTime = startTime`。
- 位置：`frontend/src/components/VttPreviewer.js:183–199`
- 播放器能力：`seekToTimestamp` 已由 `VideoPlayer` 暴露（`frontend/src/components/VideoPlayer.js:425–522`）。

3) 交互与可用性优化
- 时间戳区域添加样式提示：`cursor-pointer` 与 `title="点击时间戳跳转"`，提升可发现性。
- 可选：为整行添加 `onDoubleClick` 触发跳转，单击继续选择（不改变默认单击选择逻辑）。

## 验收与测试
- 手测：在预览/剪辑两种模式下，点击时间戳均能即时跳转；字幕文本单击仍可选择。
- 单测：为 `VttPreviewer` 与 `MonoCueItem/BilingualCueItem` 添加测试，模拟点击时间戳并断言 `seekToTimestamp` 被调用（或 `currentTime` 更新）。

## 变更范围
- 编辑文件：`MonoCueItem.js`、`BilingualCueItem.js`、`VttPreviewer.js`（最小改动）。
- 不新增后端接口、不影响后端逻辑。

## 风险与回滚
- 风险低：仅前端点击分发与调用路径调整；如需回滚，保留原点击逻辑路径。

## 实施步骤
- 修改两个字幕项组件的时间戳点击与样式。
- 优化 `VttPreviewer` 的跳转调用以兼容 YouTube。
- 联调与测试覆盖，确认无回归后提交。