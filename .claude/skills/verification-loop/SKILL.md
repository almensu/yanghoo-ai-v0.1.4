---
name: verification-loop
description: Enforces a verification-driven coding loop (plan → run → analyze → fix → re-run) and produces evidence artifacts. Use when code changes require tests/build/lint/typecheck verification, CI is failing, or UI changes need Playwright/browser checks.
---

# Verification Loop

## Quick start
- Run verification (auto-picks checks):
  `bash .claude/skills/verification-loop/scripts/verify.sh`
- Strict mode (fail if required checks are missing):
  `STRICT=1 bash .claude/skills/verification-loop/scripts/verify.sh`

## What this Skill guarantees
- Always produces an evidence bundle at: `artifacts/verify/<run_id>/`
- Uses a closed loop: **plan → execute → verify → (fail → fix → re-verify)**
- On failure: returns the failure signature + minimal fix target (see references)

## Operating procedure (for the agent)
1. Run `verify.sh` and read `artifacts/verify/<run_id>/summary.json`
2. If FAIL: delegate repair + rerun until PASS (or provide minimal repro + blockers)
3. Respond with: status, checks ran, evidence path, next action

## References
- Workflow: [reference/workflow.md](reference/workflow.md)
- Evidence format: [reference/evidence.md](reference/evidence.md)
- Subagent playbook (recommended): [reference/subagents.md](reference/subagents.md)
