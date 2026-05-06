# Codex Waiver: Stage 15.5 Browser Evidence Gap

Date: 2026-05-06
Owner: User
Recorded by: Codex
Related Audit: `docs/plans/reports/2026-05-06-codex-audit-stage-15-5-ui-evidence-revival.md`
Decision: Evidence gap waived for forward progress

## Decision

The user explicitly decided not to keep blocking Stage 15.5 on additional unobstructed browser screenshots:

```text
Stage 15.5 拍照了,如果有bug, 日后人眼审核再提需求修bug
```

Codex records this as a product/process waiver, not as a reversal of the audit finding. The prior audit remains technically accurate: static simulated state is not equivalent to audit-grade browser evidence. However, the project will not spend more time on this evidence gap now.

## Practical Outcome

Stage 15.5 may proceed as accepted for planning purposes with a residual risk:

- UI screenshot evidence is considered sufficient by user judgment.
- Any remaining visual or interaction defects should be filed later as normal UI bugs after human review.
- No production code change is required solely for this evidence gap.

## Still In Scope Separately

This waiver does not apply to Stage 16 regression hardening. Stage 16 has separate executable verification gaps around deterministic category/tag fixtures and positive evidence-pack assertions.
