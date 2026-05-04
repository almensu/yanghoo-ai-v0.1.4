# Stage 4.5 Report: Vanessa Real Channel Closed-loop Validation

Date: 2026-05-04
Executor: Gemini
Plan: `docs/plans/2026-05-04-stage-vanessa-real-channel-closed-loop-validation.md`

## Channel Identity

| Field | Value |
|-------|-------|
| URL | `https://www.youtube.com/@SpeakEnglishWithVanessa` |
| channelId | `youtube-UCxJGMJbjokfnr2-s4_RXPxQ` |
| Title | Speak English With Vanessa |
| videos.json count | 30 |
| isPartial | true |

## Commands Run

### 1. Channel Capture

```bash
npm run -s cli -- channel add "https://www.youtube.com/@SpeakEnglishWithVanessa" --limit 30 --json
```

Result:

```json
{
  "manifest": {
    "id": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
    "title": "Speak English With Vanessa",
    "isPartial": true
  },
  "videosCount": 30
}
```

### 2. Caption Sync — Batch 1

```bash
npm run -s cli -- channel captions youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --batch-size 10 --json
```

Result: processed=10, succeeded=10, failed=0, skipped=0.

### 3. Caption Sync — Batch 2 (resume)

```bash
npm run -s cli -- channel captions youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --batch-size 10 --resume --json
```

Result: processed=10, succeeded=10, failed=0, skipped=0.

### 4. Sentence Index Build

```bash
npm run -s cli -- sentence-index build --channel youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --json
```

Result:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "sourceCount": 20,
  "sentenceCount": 3246,
  "skippedCount": 10,
  "failedCount": 0,
  "warnings": []
}
```

### 5. Search Queries

```bash
npm run -s cli -- sentence-index search "QUERY" --channel youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --limit 10 --json
```

| Query | Hits | Sample Result |
|-------|------|---------------|
| `would have` | 4 | `[EsVaXsNNASc t=697s] "It would have to be that kind of situation..."` |
| `because` | 10 | `[0R22Fxe_SFE t=208s] "because it is a labor of love."` |
| `kind of` | 10 | `[0R22Fxe_SFE t=555s] "kind of support when I sleep..."` |
| `I mean` | 10 | `[EsVaXsNNASc t=397s] "I mean, is that a..."` |
| `pronunciation` | 10 | `[0R22Fxe_SFE t=365s] "a good one to practice your th pronunciation..."` |

All 5 queries returned timestamped results with valid `youtubeTimestampUrl` values.

### 6. Build/Typecheck

```bash
npm run typecheck
npm run build
```

Both passed cleanly.

## Sync Summary

| Metric | Value |
|--------|-------|
| Total invocations | 2 |
| Total attempted videos | 20 |
| Succeeded | 20 |
| Failed | 0 |
| Skipped | 0 |
| Failure kinds | N/A |

## Generated File Evidence

### Channel Data

```text
data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/channel-manifest.json
data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/videos.json (30 entries)
data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/sync-checkpoint.json
data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/caption-sync-report.json (20 items, all success)
```

### English Caption Sources (20 directories)

Each contains:

```text
data/sources/yt-{videoId}/captions/en/transcript-raw.json
data/sources/yt-{videoId}/captions/en/transcript-sentences.json
data/sources/yt-{videoId}/captions/en/transcript.vtt
data/sources/yt-{videoId}/captions/en/document.md
data/sources/yt-{videoId}/captions/captions-manifest.json (1 variant: en only)
data/sources/yt-{videoId}/transcript-manifest.json
data/sources/yt-{videoId}/record.json
```

Source IDs:

```
yt-N_hNCnh1dxs, yt-Eps9alVTEHg, yt-qfumAs6o-xc, yt-Wd_m0ugpcTs, yt-N5dKOWSHils,
yt-9QhCQapgmFk, yt-tnHANfZHKqQ, yt-N_FFrgEioFM, yt-FlAyCnxwEEQ, yt-y2_BbVC5CBc,
yt-HrG3WXJheyQ, yt-QdEhMAlQ8wI, yt-0R22Fxe_SFE, yt-csR932XBQn0, yt-A1D2464mMnI,
yt-jwJqvuoY26o, yt-EsVaXsNNASc, yt-LAK1Zj7yjyY, yt-sgie45fLCHg, yt-iru9F9kU9S0
```

### Index Data

```text
data/indexes/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/english-sentences.jsonl (3246 lines)
data/indexes/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/english-sentences-manifest.json
```

Index manifest:

```json
{
  "indexId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ-en",
  "sourceCount": 20,
  "sentenceCount": 3246,
  "skippedCount": 10,
  "failedCount": 0,
  "warnings": []
}
```

## Side-effect Verification

Scanned all 20 validation-created source directories for forbidden assets:

| Forbidden Asset Type | Result |
|---------------------|--------|
| `captions/zh-Hans/` | None found |
| `translation/` | None found |
| `audio.*` | None found |
| `media.*` | None found |

Each source's `captions-manifest.json` contains exactly 1 variant: `en` (label: 英文). No zh-Hans, translation, audio, or media assets were created by the English-only validation pipeline.

Note: pre-existing sources from prior manual captures (e.g., `yt-yq9-zVLIgk0`, `yt-OIbUCnqpzpw`) still have their zh-Hans/translation/audio assets from earlier workflows. These were not touched or modified by this validation.

## Acceptance Criteria Check

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Channel add resolves stable Vanessa channel id | PASS | `youtube-UCxJGMJbjokfnr2-s4_RXPxQ` |
| videos.json >= 20 videos | PASS | 30 videos |
| Caption sync >= 10 videos | PASS | 20 videos across 2 batches |
| One failure doesn't stop validation | N/A | 0 failures occurred |
| caption-sync-report.json records per-video statuses | PASS | 20 items, all success |
| >= 3 videos produce English captions | PASS | 20/20 succeeded |
| No zh-Hans/translation/audio/media from English-only mode | PASS | Clean scan of all 20 sources |
| english-sentences.jsonl written | PASS | 3246 lines |
| english-sentences-manifest.json written | PASS | sentenceCount=3246 |
| sentenceCount > 0 | PASS | 3246 |
| Search returns timestamped results | PASS | All 5 queries returned hits |
| Search results include youtubeTimestampUrl | PASS | e.g., `https://www.youtube.com/watch?v=0R22Fxe_SFE&t=208s` |
| npm run typecheck passes | PASS | Clean |
| npm run build passes | PASS | Clean |

## Skipped Checks

None. All acceptance criteria were verified.

## Unresolved Risks

1. **100% success rate is atypical**: All 20 videos returned English captions. In a larger batch, some videos may lack auto-generated captions, which would test the failure/reporting path. The failure path was validated in Stage 4 with fixtures but not exercised here with real data.

2. **Rate limiting not observed**: 20 sequential InnerTube requests completed without throttling. Larger batches may encounter rate limits, which the Stage 3 checkpoint/resume mechanism handles.

3. **Index rebuild overwrites**: Running `sentence-index build` again will overwrite the index entirely. Incremental or append-only indexing is not yet implemented.

4. **Older data coexistence**: Pre-existing sources with zh-Hans/translation/audio coexist in the same `data/sources/` directory. The English-only pipeline correctly ignores them, but future tooling should be aware of mixed-language source directories.
