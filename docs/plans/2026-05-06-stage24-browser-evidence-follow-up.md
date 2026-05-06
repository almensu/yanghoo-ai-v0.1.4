# Stage 24 Follow-up Plan: Browser Evidence Artifact And Rollup Fix

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready for Gemini

## Goal

Close the remaining Stage 24 audit gap by turning the provided browser screenshot into repository evidence and correcting the Stage 21-24 status rollup.

The browser screenshot already proves the required UI state:

- `Scene.KidWakeUpMorning` selected in `SCENE PACKS`,
- scene-pack header and user request visible,
- query chips visible,
- `wake up` group header visible with `5 examples`,
- selected playable example visible,
- YouTube player and Now Playing panel populated,
- global search box still contains `would have`, proving scene-pack rendering is not driven by the global search query.

## Non-Goals

- Do not change production code unless a blocker is discovered.
- Do not modify runtime `data/` pack files.
- Do not rerun broad product work.
- Do not reopen Stage 23 implementation.

## Required Work

1. Save the provided Stage 24 browser screenshot under:

   ```text
   docs/plans/reports/screenshots/stage24-kid-wake-up-morning-scene-pack.png
   ```

2. Update:

   ```text
   docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md
   ```

   Include:

   - exact screenshot path,
   - statement that the screenshot shows `Scene.KidWakeUpMorning`,
   - visible query group `wake up · 5 examples`,
   - player panel populated with the selected example,
   - global search query `would have` while scene-pack query is `wake up`.

3. Add the standalone rollup requested by the Stage 24 plan:

   ```text
   docs/plans/reports/2026-05-06-codex-rollup-stage21-24-status.md
   ```

   Required status wording:

   - Stage 21: accepted with quality notes; validation centered on `Scene.HospitalTripWithWife`.
   - Stage 22: accepted with minor follow-up notes; hard-coded-channel and near-duplicate-query notes remain non-blocking.
   - Stage 23: accepted after follow-up commit `f35b11c`.
   - Stage 24: accepted pending Codex final acceptance after screenshot artifact and rollup correction.

4. Correct any existing Stage 24 report language that says Stage 21 was validated with Vanessa data.

## Verification Commands

Run and report:

```bash
test -f docs/plans/reports/screenshots/stage24-kid-wake-up-morning-scene-pack.png
rg -n "Vanessa|HospitalTripWithWife|stage24-kid-wake-up-morning-scene-pack|wake up" docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md docs/plans/reports/2026-05-06-codex-rollup-stage21-24-status.md
git status --short
```

If production code is unchanged, `npm run typecheck` and `npm run build` may be skipped, but the report must say they were skipped because this is docs/screenshot-only.

## Expected Report

Update the existing Stage 24 report with a short follow-up section:

```text
## Browser Evidence Follow-up
```

Include changed files, screenshot path, verification commands, and unresolved risks.

Codex will then issue a final Stage 24 acceptance audit.
