#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import List, Tuple


TASK_RE = re.compile(r"^\s*-\s+\[( |x)\]\s+(T\d+)\s+(.+?)\s*$")
SECTION_RE = {
    "Scope": re.compile(r"^\s*-\s*Scope\s*$", re.IGNORECASE),
    "Files to touch": re.compile(r"^\s*-\s*Files to touch\s*$", re.IGNORECASE),
    "Implementation notes": re.compile(r"^\s*-\s*Implementation notes\s*$", re.IGNORECASE),
    "Verification": re.compile(r"^\s*-\s*Verification\s*$", re.IGNORECASE),
    "Evidence": re.compile(r"^\s*-\s*Evidence\s*$", re.IGNORECASE),
}
FILE_ITEM_RE = re.compile(r"^\s*-\s+.+/.+\..+\s*$")  # crude but useful
VER_COMMAND_RE = re.compile(r"^\s*-\s*Command\s*:\s*.+\S\s*$", re.IGNORECASE)
VER_EXPECT_RE = re.compile(r"^\s*-\s*Expected result\s*:\s*.+\S\s*$", re.IGNORECASE)


def find_tasks(lines: List[str]) -> List[Tuple[int, str, str, str]]:
    tasks: List[Tuple[int, str, str, str]] = []
    for i, line in enumerate(lines):
        m = TASK_RE.match(line)
        if m:
            tasks.append((i, m.group(1), m.group(2), m.group(3)))
    return tasks


def slice_block(lines: List[str], start: int, end: int) -> List[str]:
    return lines[start:end]


def has_section(block: List[str], name: str) -> bool:
    return any(SECTION_RE[name].match(x) for x in block)


def section_index(block: List[str], name: str) -> int | None:
    for i, x in enumerate(block):
        if SECTION_RE[name].match(x):
            return i
    return None


def validate_task_block(tid: str, title: str, block: List[str]) -> List[str]:
    errs: List[str] = []

    if len(title.strip()) < 8:
        errs.append(f"{tid} title too short, make it specific")

    for sec in SECTION_RE.keys():
        if not has_section(block, sec):
            errs.append(f"{tid} missing section: {sec}")

    # Files to touch should contain at least one file line soon after section header
    fidx = section_index(block, "Files to touch")
    if fidx is not None:
        tail = block[fidx + 1 : fidx + 12]
        has_file = any(FILE_ITEM_RE.match(x) for x in tail)
        if not has_file:
            errs.append(f"{tid} Files to touch has no file paths")

    # Verification should include Command and Expected result lines
    vidx = section_index(block, "Verification")
    if vidx is not None:
        tail = block[vidx + 1 : vidx + 12]
        if not any(VER_COMMAND_RE.match(x) for x in tail):
            errs.append(f"{tid} Verification missing Command")
        if not any(VER_EXPECT_RE.match(x) for x in tail):
            errs.append(f"{tid} Verification missing Expected result")

    return errs


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_tasks.py <tasks.md>")
        return 2

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"FAILED: file not found: {path}")
        return 2

    lines = path.read_text(encoding="utf-8").splitlines()
    tasks = find_tasks(lines)

    if not tasks:
        print("FAILED: no tasks found. Expect lines like '- [ ] T1 ...'")
        return 1

    all_errs: List[str] = []
    for idx, checked, tid, title in tasks:
        end = tasks[tasks.index((idx, checked, tid, title)) + 1][0] if tasks.index((idx, checked, tid, title)) + 1 < len(tasks) else len(lines)
        block = slice_block(lines, idx, min(end, idx + 200))
        all_errs.extend(validate_task_block(tid, title, block))

    if all_errs:
        print("FAILED: tasks.md structure issues")
        for e in all_errs:
            print("-", e)
        return 1

    print("OK: tasks.md structure looks valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
