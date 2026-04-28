# Xiaoyuzhou Episode Real Persistence

## Owner

Gemini implements. Codex reviews.

## Goal

Make the target Xiaoyuzhou episode persist real content assets, not just a placeholder source record:

```text
https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec
```

Expected source ID:

```text
xyz-69a64629de29766da93331ec
```

## Non-goals

- Do not implement Apple Podcasts in this task.
- Do not implement a generic `podcastSourceAdapter`; keep Xiaoyuzhou as the concrete platform adapter.
- Do not silently create fake transcript/document content.
- Do not mark readiness as `markdown_ready` unless generated content is based on real fetched metadata/audio/transcript.
- Do not duplicate assets into app-local data directories; use the canonical root data directory fixed for the homepage/API path.

## Target Files

- `packages/source-adapters/src/xiaoyuzhouAdapter.ts`
- `packages/application/src/index.ts`
- `packages/transcript/src/index.ts` or a dedicated transcript/audio module if needed
- `packages/storage/src/index.ts` if media/transcript metadata persistence needs extension
- `packages/domain/src/index.ts` if source/media contracts need refinement
- `scripts/collect/collect-xiaoyuzhou-url.ts`
- `scripts/transcript/refine-transcript-sentences.ts`
- report under `docs/plans/reports/`

## Requirements

### 1. Real Xiaoyuzhou episode metadata

`XiaoyuzhouSourceAdapter.capture(url)` must fetch and persist real episode metadata when accessible:

- episode title
- podcast/show title or author
- duration if available
- published date if available
- cover/thumbnail URL if available
- episode ID
- original URL

If metadata cannot be fetched, fail clearly or persist an explicit partial metadata state. Do not replace missing metadata with misleading placeholders without marking them as unknown.

### 2. Real audio acquisition path

Implement or wire an episode audio acquisition path:

- locate the actual audio URL or playable media source
- persist enough metadata to audit where audio came from
- if downloading media is required, store it under the canonical source asset directory

For this task, Gemini may choose the smallest reliable path that works for the target episode, but it must not scrape in a way that hard-codes this one episode only.

### 3. Transcript path for podcast audio

The current application pipeline rejects `xiaoyuzhou`. Gemini must implement a real path for `podcast_audio`:

```text
xiaoyuzhou metadata/media -> audio input -> transcript segments -> refiner -> VTT/Markdown/document readiness
```

Preferred product source priority still applies:

```text
platform caption/transcript if available -> imported VTT/SRT -> mlx-audio -> manual upload
```

For Xiaoyuzhou, if no platform transcript is available, use a real audio transcription path. If `mlx-audio` is unavailable in the local environment, the command must fail clearly and must not generate fake transcript assets.

### 4. No fake readiness

If the target episode cannot be transcribed, readiness must reflect the real state:

- metadata-only if only source metadata exists
- raw/refined/markdown ready only when corresponding real assets exist
- failed state if a transcript attempt fails and failure persistence is implemented

### 5. Homepage/API visibility

After successful persistence, both API and homepage proxy must expose the same canonical asset:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

Expected:

- includes `xyz-69a64629de29766da93331ec`
- `platform: xiaoyuzhou`
- `sourceClass: podcast_audio`
- readiness matches actual generated assets

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
npx tsx scripts/collect/collect-xiaoyuzhou-url.ts 'https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec'
npx tsx scripts/transcript/refine-transcript-sentences.ts xyz-69a64629de29766da93331ec
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('xyz-69a64629de29766da93331ec'), null, 2)))"
```

If transcription depends on a local binary such as `mlx-audio`, Gemini must also report:

```bash
which mlx_audio.transcribe || which mlx-audio || true
```

If local dev servers are running, verify:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

## Acceptance Criteria

- Real Xiaoyuzhou metadata is persisted in `record.json`.
- Placeholder title/author are replaced or explicitly marked as unknown when metadata fetch fails.
- Transcript/document assets are generated only from real Xiaoyuzhou episode content.
- If real transcription cannot run, no fake `document.md` is generated.
- Readiness truthfully reflects the persisted assets.
- API and homepage can see the same canonical source.
- Report includes generated file list and readiness output.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-xiaoyuzhou-episode-real-persistence-report.md
```

Report must include:

- changed files
- metadata acquisition approach
- audio acquisition/transcription approach
- whether `mlx-audio` or another transcription path was used
- verification command outputs
- generated file list
- readiness output
- homepage/API visibility result
- unresolved risks
