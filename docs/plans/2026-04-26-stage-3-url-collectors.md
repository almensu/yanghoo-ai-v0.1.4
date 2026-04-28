# Stage 3: URL Collectors

## Owner

Gemini implements. Codex reviews.

## Goal

Implement the first real platform adapters for YouTube and Xiaoyuzhou, and establish the file-system-based storage implementation.

## Non-goals

- Do not implement real transcription (mlx-audio) yet.
- Do not implement complex error handling for network failures (use simple stubs/fallbacks).
- Do not implement OAuth for any platform.

## Tasks

### 1. Implement FileStorage

In `packages/storage`, implement the interfaces defined in Stage 2 using the Node.js `fs` module.
- Use `packages/domain/src/storage.ts` for path resolution.
- Ensure directories are created automatically.

### 2. Implement YouTube Adapter

In `packages/source-adapters`:
- Create `youtubeAdapter.ts`.
- Implementation: For MVP, use a simple metadata fetch (e.g., using a lightweight library or stubbing the actual HTTP call if no library is available). 
- *Constraint*: Focus on converting platform-specific metadata into the `Source` domain model.

### 3. Implement Xiaoyuzhou Adapter

In `packages/source-adapters`:
- Create `xiaoyuzhouAdapter.ts`.
- Focus on extracting episode info from the URL.

### 4. Create Capture Script Entrypoints

Update or create scripts in `scripts/collect/`:
- `collect-youtube-url.ts`
- `collect-xiaoyuzhou-url.ts`

These scripts should:
1. Parse CLI arguments (URL).
2. Call the appropriate adapter.
3. Save the resulting `Source` record using `FileStorage`.

### 5. Update Application Use Case

Update `captureSourceUseCase` in `packages/application` to coordinate between adapters and storage.

## Acceptance Criteria

- Running `npx tsx scripts/collect/collect-youtube-url.ts "https://www.youtube.com/watch?v=..."` creates a valid `data/sources/{id}/record.json`.
- The saved record includes correct `sourceClass`, `platform`, `title`, and `capturedAt`.
- Project passes `npm run typecheck`.

## Verification Commands

```bash
# Manual verification of record creation
npx tsx scripts/collect/collect-youtube-url.ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
ls -R data/sources/
```
