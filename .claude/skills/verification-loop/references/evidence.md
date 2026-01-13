# Evidence Bundle

## Output location
artifacts/verify/<run_id>/

## Files
- changed_files.txt      # inputs: what changed
- plan.json              # planned checks + commands + skips
- commands.log           # executed commands
- stdout.log / stderr.log
- summary.json           # single source of truth

## summary.json schema
{
  "status": "success" | "failed",
  "checks_ran": ["..."],
  "checks_skipped": [{"check":"...", "reason":"..."}],
  "failed_check": "..." | "",
  "failure_signature": "..." | "",
  "duration_seconds": 12,
  "run_id": "YYYYMMDD-HHMMSS",
  "evidence_path": "artifacts/verify/<run_id>/"
}
