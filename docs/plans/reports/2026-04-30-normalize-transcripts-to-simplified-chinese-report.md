# Report: Normalize Chinese Transcripts to Simplified Chinese

## Summary

Successfully implemented transcript normalization to ensure all user-facing Chinese content is presented in Simplified Chinese. This covers MLX transcription outputs, platform captions (e.g., YouTube), and generated Markdown documents.

## Changed Files

- `packages/transcript/package.json`: Added `opencc-js` dependency.
- `packages/transcript/src/normalizeChineseTranscriptText.ts`: Implemented conversion helpers using `opencc-js` (Traditional to Simplified).
- `packages/transcript/src/opencc-js.d.ts`: Added TypeScript declarations for `opencc-js`.
- `packages/transcript/src/index.ts`: Exported normalization helpers.
- `packages/application/src/index.ts`: Integrated normalization into `transcribeAudioUseCase` and `ensureTranscriptUseCase`.
- `docs/plans/reports/2026-04-30-normalize-transcripts-to-simplified-chinese-report.md`: This report.

## Dependency Added

- `opencc-js`: Version ^1.0.5

## Implementation Details

- **Conversion Logic**: Uses `opencc-js` with the `tw` to `cn` dictionary, which provides robust character-level and phrase-level conversion from Traditional Chinese to Simplified Chinese.
- **Pipeline Integration**:
  - **MLX Path**: Segments are normalized immediately after being parsed from MLX output and before sentence refinement.
  - **YouTube Path**: Captions are normalized immediately after fetching and before refinement.
  - **Metadata**: Language is automatically set to `zh-Hans` if Chinese characters are detected in the normalized transcript or if the source language was already a variant of Chinese.
  - **Documents**: Document titles are normalized before being written to Markdown files.

## Verification Results

### Conversion Examples

Verified using a custom Node.js script:

| Input (Traditional) | Output (Simplified) | Result |
| :--- | :--- | :--- |
| `繁體中文` | `繁体中文` | ✅ Pass |
| `下載視頻` | `下载视频` | ✅ Pass |
| `裡面` | `里面` | ✅ Pass |
| `後臺` | `后台` | ✅ Pass |
| `臺灣` | `台湾` | ✅ Pass |
| `這個節目裡面講了什麼` | `这个节目里面讲了什么` | ✅ Pass |

### Build and Typecheck

- `npm run build`: Pass
- `npm run typecheck`: Pass

## Conclusion

All Chinese transcript assets (JSON, VTT, Markdown) are now persisted in Simplified Chinese. This change is foundational and ensures consistency across all user-facing features, including the reader and exported files.
