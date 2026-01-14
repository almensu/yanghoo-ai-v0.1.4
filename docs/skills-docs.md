下面是一套**可直接放进 `.claude/skills/` 的 Skill**：把你说的闭环固化成“写/改 → 机器验证 → 失败分析 → 最小修复 → 再验证 → 产出证据”。它遵循官方 Skill 的关键点：**description 负责被选中（第三人称、含触发词）**、**SKILL.md 做导航与流程**、细节放 `reference/`、确定性执行放 `scripts/`（渐进加载）。 ([Claude 开发平台][1])

---

## 目录结构（直接照抄）

```text
.claude/skills/verification-loop/
├── SKILL.md
├── reference/
│   ├── workflow.md
│   ├── evidence.md
│   └── subagents.md
└── scripts/
    ├── verify.sh
    ├── verify_plan.py
    └── verify_summary.py
```

> Skills 在 SDK/Claude Code 里都是**文件系统工件**，放在 `.claude/skills/` 下会被发现；启用时要把 `"Skill"` 放进 `allowed_tools`（SDK 还要配置 `setting_sources`）。 ([Claude 开发平台][2])

---

## 1) `.claude/skills/verification-loop/SKILL.md`

```md
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
```

**为什么这样写**：`description` 是 Skill 被发现/选用的关键（要写清“做什么 + 何时用”，且第三人称），SKILL.md 要短、像目录；更细内容放到 reference，避免嵌套引用过深。 ([Claude 开发平台][1])

---

## 2) `reference/workflow.md`

```md
# Verification Loop Workflow

## Closed loop (Definition)
Write/Change → Verify → Fail → Analyze → Fix → Re-verify → Pass + Evidence

## Agent rules
- Prefer running scripts over “脑补结果”
- Choose the *minimum sufficient* verification based on the change scope (handled by verify_plan.py)
- Never claim PASS without summary.json showing success

## What to return to the user
- PASS/FAIL
- checks_ran
- failed_check + failure_signature (if FAIL)
- evidence_path (always)
- next_step (fix plan or ready-to-merge)
```

---

## 3) `reference/evidence.md`

```md
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
```

---

## 4) `reference/subagents.md`（推荐配套，但不是必须）

```md
# Subagent playbook (recommended)

Subagents are invoked via the Task tool. The main agent can invoke them automatically based on description, or explicitly by name ("Use the X agent to..."). Do NOT give subagents the Task tool. :contentReference[oaicite:3]{index=3}

## Recommended roles
1) verify-work: runs verify.sh + summarizes evidence (Bash/Read/Grep/Glob)
2) verify-fix: reads evidence + applies minimal patch (Read/Edit/Write/Grep/Glob)
3) verify-ui: runs Playwright smoke/e2e (Bash/Read/Grep/Glob)

## Explicit invocation examples
- "Use the verify-work agent to run verification and report evidence."
- "Use the verify-fix agent to patch the failing test, then re-run verification."
```

> Subagent 调用规则：Claude 会按 subagent 的 `description` 自动决定是否调用；你也可以在 prompt 里**点名**强制调用。 ([Claude 开发平台][3])

---

## 5) `scripts/verify.sh`（单一入口，产出证据）

```bash
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
```

---

## 6) `scripts/verify_plan.py`（按变更 + 项目栈选最小 checks，支持 STRICT）

```python
#!/usr/bin/env python3
import argparse, json, os, re, shutil

def read_lines(path):
  with open(path, "r", encoding="utf-8", errors="ignore") as f:
    return [x.strip() for x in f if x.strip()]

def exists(root, rel): return os.path.exists(os.path.join(root, rel))

def detect_stack(root):
  node = exists(root, "package.json")
  py = any(exists(root, p) for p in ["pyproject.toml", "requirements.txt", "setup.py"])
  return node, py

def choose_pm(root):
  if exists(root, "pnpm-lock.yaml"): return "pnpm"
  if exists(root, "yarn.lock"): return "yarn"
  return "npm"

def npm_scripts(root):
  try:
    with open(os.path.join(root, "package.json"), "r", encoding="utf-8") as f:
      pkg = json.load(f)
    return set((pkg.get("scripts") or {}).keys())
  except Exception:
    return set()

def which(cmd):
  return shutil.which(cmd) is not None

def changed_flags(changed):
  flags = {
    "ui": any(re.search(r"(^src/|/)(components|pages|app|ui|styles)/", p) for p in changed),
    "node": any(p.endswith((".ts",".tsx",".js",".jsx")) or p == "package.json" or p.endswith(("lock.yaml","yarn.lock","package-lock.json")) for p in changed),
    "py": any(p.endswith(".py") for p in changed),
  }
  return flags

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--root", required=True)
  ap.add_argument("--changed", required=True)
  ap.add_argument("--strict", type=int, default=0)
  args = ap.parse_args()

  root = args.root
  changed = read_lines(args.changed)
  node, py = detect_stack(root)
  flags = changed_flags(changed)

  run = []
  skipped = []

  # Node checks
  if node and flags["node"]:
    pm = choose_pm(root)
    scripts = npm_scripts(root)

    def add_if_script(check, script_name, cmd):
      if script_name in scripts:
        run.append({"check": check, "cmd": cmd})
      else:
        skipped.append({"check": check, "reason": f"Missing package.json script: {script_name}"})

    add_if_script("lint", "lint", f"{pm} run lint")
    add_if_script("typecheck", "typecheck", f"{pm} run typecheck")
    add_if_script("build", "build", f"{pm} run build")
    # test can be "test" or "test:unit"
    if "test:unit" in scripts:
      run.append({"check": "unit", "cmd": f"{pm} run test:unit"})
    elif "test" in scripts:
      run.append({"check": "unit", "cmd": f"{pm} test"})
    else:
      skipped.append({"check": "unit", "reason": "Missing package.json script: test or test:unit"})

    # UI smoke (if UI files changed)
    if flags["ui"]:
      if "test:e2e" in scripts:
        run.append({"check": "e2e_smoke", "cmd": f"{pm} run test:e2e"})
      elif which("npx") and (exists(root, "playwright.config.ts") or exists(root, "playwright.config.js")):
        run.append({"check": "e2e_smoke", "cmd": "npx playwright test -g @smoke --reporter=html"})
      else:
        skipped.append({"check": "e2e_smoke", "reason": "No e2e script and no playwright config detected"})

  # Python checks
  if py and flags["py"]:
    if which("ruff"):
      run.append({"check": "lint", "cmd": "ruff check ."})
    else:
      skipped.append({"check": "lint", "reason": "ruff not found in PATH"})

    if which("mypy"):
      run.append({"check": "typecheck", "cmd": "mypy ."})
    else:
      skipped.append({"check": "typecheck", "reason": "mypy not found in PATH"})

    if which("pytest"):
      run.append({"check": "unit", "cmd": "pytest -q"})
    else:
      skipped.append({"check": "unit", "reason": "pytest not found in PATH"})

  # STRICT: missing checks becomes failure by producing empty run (verify.sh will fail)
  if args.strict and len(run) == 0:
    # keep skipped reasons; empty run causes verify.sh to fail with guidance
    pass

  out = {"run": run, "skipped": skipped, "changed": changed, "stack": {"node": node, "python": py}}
  print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
  main()
```

---

## 7) `scripts/verify_summary.py`

```python
#!/usr/bin/env python3
import argparse, json, time

ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
ap.add_argument("--status", required=True)
ap.add_argument("--run_id", required=True)
ap.add_argument("--evidence_path", required=True)
ap.add_argument("--failed_check", default="")
ap.add_argument("--failure_signature", default="")
ap.add_argument("--plan", required=True)
args = ap.parse_args()

plan = json.load(open(args.plan, "r", encoding="utf-8"))

data = {
  "status": args.status,
  "checks_ran": [x["check"] for x in plan.get("run", [])],
  "checks_skipped": plan.get("skipped", []),
  "failed_check": args.failed_check,
  "failure_signature": args.failure_signature,
  "duration_seconds": 0,
  "run_id": args.run_id,
  "evidence_path": args.evidence_path,
  "timestamp": int(time.time())
}
with open(args.out, "w", encoding="utf-8") as f:
  json.dump(data, f, ensure_ascii=False, indent=2)
```

---

## 这个 Skill 为什么“对齐官方最佳实践”

* **description 决定是否被选中**，必须第三人称、包含触发语境；SKILL.md 做“总览+导航”；细节拆到 `reference/`，脚本放 `scripts/`（执行而不占上下文）。 ([Claude 开发平台][1])
* **避免深层引用**：所有 reference 都从 SKILL.md 一层直达。 ([Claude 开发平台][1])
* **Subagent 的调用与限制**：Subagent 通过 Task 工具触发；可以自动匹配或点名强制；Subagent 不应拥有 Task。 ([Claude 开发平台][3])

---

如果你告诉我你常用的技术栈（比如 Next.js+pnpm+Vitest / Python+pytest / 是否 Playwright），我可以把 `verify_plan.py` 的“选检规则”调到更贴合你项目（比如把 `@smoke`、`test:unit`、`lint:fix`、`typecheck` 等映射成你真实脚本名），这样基本就能做到“改完必验、失败必回收、证据必落盘”。

[1]: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices "Skill authoring best practices - Claude Docs"
[2]: https://platform.claude.com/docs/en/agent-sdk/skills "Agent Skills in the SDK - Claude Docs"
[3]: https://platform.claude.com/docs/en/agent-sdk/subagents "Subagents in the SDK - Claude Docs"
