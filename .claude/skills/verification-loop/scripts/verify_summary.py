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
