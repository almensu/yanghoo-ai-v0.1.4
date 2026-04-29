# UI Explicit Transcript and Audio Actions Report

## Status
Success. The TaskCard UI has been updated to support localized Chinese labels and a staged, explicit workflow for audio and transcript acquisition.

## Environment
- **DATA_DIR**: `/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data`
- **MLX_AUDIO_PYTHON**: `/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python`

## UI State Verification

### 1. Ready Document (Xiaoyuzhou E45)
- **Task ID**: `xyz-69a64629de29766da93331ec`
- **Status Label**: `文档就绪`
- **Source Label**: `MLX 音频转写`
- **Primary Action**: `阅读` (Blue background)
- **Evidence**: Transcription of the 3.4-hour episode completed successfully.

### 2. Caption-capable Source (YouTube)
- **Platform**: `youtube`
- **Primary Action**: `载字幕` (Enabled when no markdown ready)
- **Behavior**: Calls `ensureTranscript`.

### 3. Audio Source without Audio (Xiaoyuzhou/Podcast)
- **Primary Action**: `下载音频` (Enabled when `hasAudio` is false and `mediaUrl` exists)
- **Behavior**: Calls `fetchAudio`.

### 4. Audio Fetched but no Transcript
- **Primary Action**: `音频转字幕` (Enabled when `hasAudio` is true and no markdown ready)
- **Behavior**: Calls `transcribeAudio`.

## Key Changes
- **TaskCard.tsx**:
  - Implemented `formatDuration`, `statusLabel`, and `transcriptSourceLabel` with Chinese translations.
  - Added visibility and enablement rules for `载字幕`, `下载音频`, and `音频转字幕`.
  - Added action-specific loading states (`载入中...`, `下载中...`, `转写中...`).
  - Localized the secondary menu (解析媒体, 强制下载, 强制处理, 查看元数据).
  - Ensured that running any action disables all other actions on the same card.

## Verification Results
- **npm run build**: Success
- **npm run typecheck**: Success
- **End-to-End**: Verified by capturing, fetching, and transcribing the 3.4-hour Xiaoyuzhou episode `69a64629de29766da93331ec`.

### Generated Assets for xyz-69a64629de29766da93331ec
```text
data/sources/xyz-69a64629de29766da93331ec/
├── audio.m4a (368MB)
├── audio-manifest.json
├── document.md (Full transcript generated from MLX)
├── mlx_out_xyz-69a64629de29766da93331ec.json
├── record.json
├── transcript-manifest.json
├── transcript-raw.json
├── transcript-sentences.json
└── transcript.vtt
```

## Unresolved Risks
- **Long Transcription UI**: For 3.4-hour files, the HTTP request might time out or the UI might lose track of progress if the page is refreshed. A persistent "Background Task" or "Job" status would be better for very long files.
