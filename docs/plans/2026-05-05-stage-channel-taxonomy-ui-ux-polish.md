# Stage 15.5 Plan: Channel Taxonomy UI/UX Polish

Date: 2026-05-05
Owner: Codex
Executor: Gemini or Codex
Status: Ready

## Context

Stage 15 added channel taxonomy:

- category,
- tags,
- note,
- Channel URL Library editor,
- English Search category/tag filters,
- Select visible / Clear visible.

The functional audit passed, but there was no browser UI/UX verification. This stage is a focused UI polish and browser validation pass. It should not change backend behavior unless a UI bug exposes a small API issue.

## Goals

- Verify taxonomy UI in a real browser.
- Make Channel URL Library taxonomy editing easy to understand.
- Make English Search channel filtering and bulk selection obvious.
- Ensure category/tag text does not overflow.
- Ensure empty/uncategorized states are clear.
- Improve layout on desktop and narrow/mobile widths.
- Add lightweight UI smoke evidence.

## Non-Goals

- Do not redesign the whole app.
- Do not add AI auto-classification.
- Do not add multi-level taxonomy.
- Do not add tag colors or custom taxonomy management pages.
- Do not change subtitle sync, sentence search, saved examples, or machine translation.
- Do not add new persistence model.

## Surfaces to Review

### Channel URL Library

Review:

- channel card/list taxonomy display,
- channel detail/header taxonomy display,
- category input,
- tags input,
- note input,
- save/cancel behavior,
- validation/error behavior,
- loading/saving state.

Expected polish:

- show `Uncategorized` clearly when no category,
- tags appear as compact chips, not only raw comma text where possible,
- long category/tag values truncate or wrap cleanly,
- save action has visible pending state,
- after save, displayed values update without needing page refresh,
- edit controls do not visually compete with subtitle sync controls.

### English Search Channel Selector

Review:

- Category dropdown,
- Tag dropdown,
- visible channel count,
- selected channel count,
- Select visible,
- Clear visible,
- Select all indexed,
- Clear all,
- filtered empty state.

Expected polish:

- counts read clearly:

```text
3 visible · 12 selected
```

- hidden selected channels remain selected, but UI should make this understandable,
- Select visible / Clear visible should not look destructive to all channels,
- filters should be compact but not cramped,
- channel rows should show category/tags without overflowing.

## Browser QA Matrix

Desktop:

```text
1440 x 900
```

Narrow desktop / tablet:

```text
900 x 800
```

Mobile-ish:

```text
390 x 844
```

Check:

- no overlapping text,
- no clipped buttons,
- taxonomy editor usable,
- dropdowns usable,
- result/player panels still usable in English Search,
- long tags do not break layout,
- selected/visible counts remain readable.

## Suggested UI Improvements

Only implement if browser review confirms need:

- Extract small taxonomy badges component:

```text
ChannelTaxonomyBadges.tsx
```

- Extract small taxonomy editor component:

```text
ChannelTaxonomyEditor.tsx
```

- Add category/tag chips with max width and truncation.
- Add a short helper label near bulk actions:

```text
Visible = channels matching current filters
```

- Rename buttons if clearer:

```text
Select visible
Clear visible
```

could become:

```text
Select filtered
Clear filtered
```

Only rename if it improves clarity.

## Verification Requirements

Run:

```bash
npm run typecheck
npm run build
npx tsx scripts/ops/verify-stage15-channel-categories-and-tags.ts
```

If UI-only changes are made, existing Stage 15 verification should still pass.

Browser smoke:

- Start API and web if needed.
- Open `http://localhost:3000`.
- Visit Channel URL Library.
- Edit one channel taxonomy:
  - category: `street interview`
  - tags: `American, conversation, fast speaking`
  - note: short note
- Confirm normalized display:
  - `street-interview`
  - `american`, `conversation`, `fast-speaking`
- Visit English Search.
- Filter category/tag.
- Use Select visible and Clear visible.
- Confirm counts and selected state behave correctly.

If browser automation is unavailable, include manual smoke notes and screenshots if possible.

## Acceptance Criteria

- Channel taxonomy editor is visible and understandable.
- Category/tags/note can be edited and saved from the UI.
- Saved taxonomy appears immediately after save.
- English Search can filter channels by category/tag from UI.
- Select visible and Clear visible work from UI.
- Empty filtered state is clear.
- Long tags/categories do not break layout.
- Desktop and mobile-ish layouts are usable.
- Stage 15 verification still passes.
- Typecheck and build pass.

## Expected Report Path

Write:

```text
docs/plans/reports/2026-05-05-channel-taxonomy-ui-ux-polish-report.md
```

Report must include:

- changed files,
- screenshots or browser smoke notes,
- viewport sizes checked,
- taxonomy edit smoke result,
- English Search filter smoke result,
- verification commands and results,
- skipped checks and reasons,
- residual UI risks.

## Audit Checklist

Reject if:

- UI changes break taxonomy persistence,
- UI changes make subtitle sync look like media download,
- long tags overflow controls,
- mobile layout becomes unusable,
- Select visible / Clear visible semantics are unclear,
- no browser/manual UI evidence is provided,
- typecheck/build or Stage 15 verification fails.
