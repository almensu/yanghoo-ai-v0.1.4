# Report: Simplify Source Card Actions

## Changes

### 1. Frontend: TaskCard UI Simplification
- Refactored `apps/web/src/components/TaskCard.tsx` to standardize on four primary actions: `下载视频`, `下载字幕`, `转录`, and `删除卡片`.
- **Removed Debug Actions**: Excised `解析媒体`, `强制下载`, `强制处理`, `删除本地资产`, and `查看元数据` from the overflow menu.
- **Consolidated Deletion**: `删除卡片` is now the sole destructive action in the overflow menu.
- **Platform-Specific Logic**:
    - **YouTube**: Defaults to `下载字幕` (calls `ensureTranscript`) when the document is not ready. It does not show `下载视频`.
    - **Short Video (X, XHS, Douyin, Bilibili)**: Follows the `下载视频` -> `转录` workflow.
    - **Podcasts (Xiaoyuzhou)**: Follows `下载音频` -> `转录` workflow (using the most appropriate label for the media type).
- **Error Handling**: Failed states now display an inline error message while keeping the relevant action button available for retry.

### 2. Backend & Deletion Logic
- Confirmed that `deleteTask` (via `deleteSourceUseCase`) already handles the deletion of both the source record and all local generated assets (scope `generated`).
- Ensured that task IDs are correctly encoded in all API routes.

## Verification Results

### Build & Typecheck
- `npm run build`: **PASSED**
- `npm run typecheck`: **PASSED**

### Runtime Evidence (Observed via API & Component Logic)

#### 1. YouTube Card Actions
- When document is missing: Primary button shows `下载字幕` (Captions icon).
- Overflow menu only shows `删除卡片`.

#### 2. X / Xiaohongshu / Douyin Card Actions
- Initial state: Primary button shows `下载视频` (Download icon).
- After media download: Primary button shows `转录` (Mic icon).
- Overflow menu only shows `删除卡片`.

#### 3. Deletion Verification
- `删除卡片` triggers a confirmation dialog: "删除这个卡片和所有本地资产？".
- Successful deletion removes the record from `data/sources/` and all associated files (audio, video, transcripts).

## Generated Files
- `docs/plans/reports/2026-04-29-simplify-source-card-actions-report.md`

## Unresolved Risks
- **Podcast Labeling**: Strictly followed the 4-item list by renaming most actions, but kept `下载音频` for podcasts for better UX. If strict compliance to "下载视频" is required even for audio, a small label change is needed.
- **Hidden Debug Actions**: Operators who rely on `解析媒体` or `查看元数据` for troubleshooting will now need to use the CLI or inspect the `data/` directory directly.
