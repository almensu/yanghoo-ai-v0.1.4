# Normalize Chinese Transcripts to Simplified Chinese

## Goal

Ensure user-facing Chinese transcript output is Simplified Chinese.

Observed problem:

```text
MLX transcription output contains Traditional Chinese characters.
User expects Simplified Chinese.
```

The fix must apply to persisted transcript assets and generated documents, not only to frontend display.

## Non-Goals

- Do not rewrite transcript meaning or summarize content.
- Do not use an LLM to translate/rewrite transcript text.
- Do not run a frontend-only replacement that leaves persisted files in Traditional Chinese.
- Do not convert non-Chinese text unnecessarily.
- Do not treat shownotes/descriptions as transcripts.

## Required Behavior

Add a transcript text normalization step that converts Chinese transcript text to Simplified Chinese before user-facing assets are saved.

Affected outputs:

- `transcript-raw.json`
- `transcript-sentences.json`
- `transcript.vtt`
- `document.md`
- reader content returned through `/api/tasks/:taskId`

Sources to cover:

- MLX audio transcription from podcasts.
- MLX audio transcription from downloaded media such as X/Xiaohongshu/Douyin/Bilibili/TikTok.
- Platform caption paths, including YouTube, when selected captions are Traditional Chinese or mixed Chinese.

## Placement

Implement this in `packages/transcript`, not in React.

Recommended shape:

```text
packages/transcript/src/normalizeChineseTranscriptText.ts
```

or equivalent local naming consistent with the repo.

Expose helpers such as:

```ts
normalizeTranscriptText(text: string): string
normalizeTranscriptSegments(segments: TranscriptSegment[]): TranscriptSegment[]
```

Use a proper conversion library or proven conversion table/API. Prefer an established library such as `opencc-js` or equivalent. Do not hand-roll a tiny ad hoc mapping except as a last-resort fallback with explicit limitations.

## Integration Points

Apply normalization before persistence in:

- `transcribeAudioUseCase` after MLX output is parsed and before `refineTranscriptSentences`.
- `ensureTranscriptUseCase` for YouTube/platform captions before `refineTranscriptSentences`.
- Any media transcription path that calls `transcribeAudioUseCase` should inherit the same behavior.

Do not normalize timestamps or IDs, only transcript text fields and document title if title text is intentionally user-facing Chinese. Keep source metadata untouched unless a task explicitly asks to normalize titles.

## Metadata

If a transcript manifest records language, prefer `zh-Hans` for normalized Chinese output when the source language is Chinese or unknown-Chinese. Do not falsely label English or other-language transcripts as Chinese.

If reliable language detection is not present, do not block the conversion step: converting non-Chinese text with a proper OpenCC-style converter should be effectively no-op for most Latin text.

## Target Files

Likely files:

- `packages/transcript/src/index.ts`
- `packages/transcript/package.json` if adding a dependency
- `packages/application/src/index.ts`
- `packages/application/src/transcribeSourceMediaUseCase.ts` only if needed
- `scripts/ops/*` for focused verification if useful
- `docs/GOTCHAS.md` only if a repeatable trap is discovered

## Acceptance Criteria

- MLX output containing Traditional Chinese is persisted as Simplified Chinese in transcript JSON, VTT, and Markdown.
- YouTube/platform captions containing Traditional Chinese are persisted as Simplified Chinese.
- Frontend reader shows Simplified Chinese because persisted `document.md` is Simplified Chinese.
- Conversion preserves timestamps and segment ordering.
- English text remains unchanged.
- Tests or verification include Traditional-to-Simplified examples such as:

```text
繁體中文 -> 繁体中文
下載視頻 -> 下载视频
裡面 -> 里面
後臺 -> 后台
臺灣 -> 台湾
這個節目裡面講了什麼 -> 这个节目里面讲了什么
```

- Existing `npm run build` and `npm run typecheck` pass.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

Focused verification should include either a unit script or Node command proving conversion:

```bash
node -e "import('@yanghoo/transcript').then(m => console.log(m.normalizeTranscriptText('這個節目裡面講了什麼，下載視頻。')))"
```

Expected output:

```text
这个节目里面讲了什么，下载视频。
```

Pipeline verification:

- Run a small MLX/audio fixture or existing source that previously produced Traditional Chinese.
- Confirm:
  - `transcript-sentences.json` contains Simplified Chinese,
  - `transcript.vtt` contains Simplified Chinese,
  - `document.md` contains Simplified Chinese,
  - `/api/tasks/:taskId` reader content contains Simplified Chinese.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-30-normalize-transcripts-to-simplified-chinese-report.md
```

The report must include:

- changed files,
- dependency added, if any,
- exact commands run,
- conversion examples,
- before/after transcript excerpt,
- generated file list,
- build/typecheck output,
- unresolved risks.
