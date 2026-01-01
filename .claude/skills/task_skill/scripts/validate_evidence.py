#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import List, Tuple, Optional


TASK_RE = re.compile(r"^\s*-\s+\[( |x)\]\s+(T\d+)\s+(.+?)\s*$")
EVIDENCE_RE = re.compile(r"^\s*-\s*Evidence\s*$", re.IGNORECASE)
SPEC_VERSION_RE = re.compile(r"^\s*-\s*Spec version\s*:\s*(\S+)\s*$", re.IGNORECASE)

INDEX_CURRENT_RE = re.compile(r"^\s*Current\s*:\s*(\S+)\s*$", re.IGNORECASE)


def find_task_headers(lines: List[str]) -> List[Tuple[int, str, str, str]]:
    tasks: List[Tuple[int, str, str, str]] = []
    for i, line in enumerate(lines):
        m = TASK_RE.match(line)
        if m:
            tasks.append((i, m.group(1), m.group(2), m.group(3)))
    return tasks


def find_current_spec(tasks_md_path: Path) -> Optional[str]:
    try:
        specs_dir = tasks_md_path.parent.parent
        index_path = specs_dir / "index.md"
    except Exception:
        return None

    if not index_path.exists():
        return None

    for line in index_path.read_text(encoding="utf-8").splitlines():
        m = INDEX_CURRENT_RE.match(line)
        if m:
            return m.group(1).strip()
    return None


def section_index(block: List[str], regex: re.Pattern[str]) -> Optional[int]:
    for i, x in enumerate(block):
        if regex.match(x):
            return i
    return None


def extract_spec_version(block: List[str]) -> Optional[str]:
    for x in block:
        m = SPEC_VERSION_RE.match(x)
        if m:
            return m.group(1).strip()
    return None


def has_non_empty_evidence(block: List[str]) -> bool:
    eidx = section_index(block, EVIDENCE_RE)
    if eidx is None:
        return False
    tail = block[eidx + 1 : eidx + 25]
    for x in tail:
        s = x.strip()
        if not s:
            continue
        if s in ["-", "*"]:
            continue
        return True
    return False


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_evidence.py <tasks.md>")
        return 2

    tasks_path = Path(sys.argv[1])
    if not tasks_path.exists():
        print(f"FAILED: file not found: {tasks_path}")
        return 2

    current_spec = find_current_spec(tasks_path)
    if not current_spec:
        print("FAILED: cannot read specs/index.md Current field, required for MVP enforcement")
        print("Expected specs/index.md contains a line like 'Current: 01_mvp'")
        return 1

    lines = tasks_path.read_text(encoding="utf-8").splitlines()
    tasks = find_task_headers(lines)

    done = [(idx, tid, title) for idx, chk, tid, title in tasks if chk == "x"]
    if not done:
        print("OK: no completed tasks, nothing to validate")
        return 0

    errs: List[str] = []
    for i, (start, chk, tid, title) in enumerate(tasks):
        if chk != "x":
            continue

        end = tasks[i + 1][0] if i + 1 < len(tasks) else len(lines)
        block = lines[start:end]

        spec_v = extract_spec_version(block)
        if not spec_v:
            errs.append(f"{tid} completed but Spec version missing")
        elif spec_v != current_spec:
            errs.append(f"{tid} Spec version mismatch, got {spec_v}, expected {current_spec}")

        if section_index(block, EVIDENCE_RE) is None:
            errs.append(f"{tid} completed but Evidence section missing")
            continue

        if not has_non_empty_evidence(block):
            errs.append(f"{tid} Evidence empty, paste command output or result")

    if errs:
        print("FAILED: evidence validation errors")
        for e in errs:
            print("-", e)
        return 1

    print(f"OK: evidence present for completed tasks, Current spec is {current_spec}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
