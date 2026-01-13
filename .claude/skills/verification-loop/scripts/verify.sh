#!/usr/bin/env bash
set -euo pipefail

STRICT="${STRICT:-0}"
BASE_REF="${BASE_REF:-HEAD~1}"
RUN_ID="${RUN_ID:-$(date +%Y%m%d-%H%M%S)}"

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

OUT_DIR="$ROOT/artifacts/verify/$RUN_ID"
mkdir -p "$OUT_DIR"

# 1) collect changed files
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git diff --name-only "$BASE_REF" HEAD | tee "$OUT_DIR/changed_files.txt" >/dev/null || true
else
  # fallback: no git
  find "$ROOT" -type f | sed "s|^$ROOT/||" > "$OUT_DIR/changed_files.txt"
fi

# 2) plan checks (auto-detect stack + scripts)
python3 "$SKILL_DIR/scripts/verify_plan.py" \
  --root "$ROOT" \
  --changed "$OUT_DIR/changed_files.txt" \
  --strict "$STRICT" \
  > "$OUT_DIR/plan.json"

# 3) execute
: > "$OUT_DIR/commands.log"
: > "$OUT_DIR/stdout.log"
: > "$OUT_DIR/stderr.log"

status="success"
failed_check=""
failure_signature=""

run_check () {
  local name="$1"
  local cmd="$2"
  echo "### $name: $cmd" | tee -a "$OUT_DIR/commands.log"
  (bash -lc "$cmd") \
    1> >(tee -a "$OUT_DIR/stdout.log") \
    2> >(tee -a "$OUT_DIR/stderr.log" >&2)
}

checks_len="$(python3 -c "import json;print(len(json.load(open('$OUT_DIR/plan.json'))['run']))")"

if [[ "$checks_len" -eq 0 ]]; then
  status="failed"
  failed_check="(none)"
  failure_signature="No runnable checks detected. Add project scripts (lint/test/build) or run with STRICT=0 to allow skips."
else
  python3 - <<'PY' "$OUT_DIR/plan.json"
import json,sys
p=json.load(open(sys.argv[1]))
for item in p["run"]:
  print(item["check"]+"\t"+item["cmd"])
PY
  while IFS=$'\t' read -r check cmd; do
    if ! run_check "$check" "$cmd"; then
      status="failed"
      failed_check="$check"
      failure_signature="$(tail -n 30 "$OUT_DIR/stderr.log" | tr -d '\r' | tail -n 10 | sed 's/\t/  /g')"
      break
    fi
  done < <(python3 - <<'PY' "$OUT_DIR/plan.json"
import json,sys
p=json.load(open(sys.argv[1]))
for item in p["run"]:
  print(item["check"]+"\t"+item["cmd"])
PY
)
fi

# 4) summarize
python3 "$SKILL_DIR/scripts/verify_summary.py" \
  --out "$OUT_DIR/summary.json" \
  --status "$status" \
  --run_id "$RUN_ID" \
  --evidence_path "artifacts/verify/$RUN_ID" \
  --failed_check "$failed_check" \
  --failure_signature "$failure_signature" \
  --plan "$OUT_DIR/plan.json"

echo "[verify] $status evidence=$OUT_DIR"
test "$status" = "success"
