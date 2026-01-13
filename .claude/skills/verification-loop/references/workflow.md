# Verification Loop Workflow

## Closed loop (Definition)
Write/Change → Verify → Fail → Analyze → Fix → Re-verify → Pass + Evidence

## Agent rules
- Prefer running scripts over "脑补结果"
- Choose the *minimum sufficient* verification based on the change scope (handled by verify_plan.py)
- Never claim PASS without summary.json showing success

## What to return to the user
- PASS/FAIL
- checks_ran
- failed_check + failure_signature (if FAIL)
- evidence_path (always)
- next_step (fix plan or ready-to-merge)
