#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import List, Tuple, Optional


TASK_RE = re.compile(r"^\s*-\s+\[( |x)\]\s+(T\d+)\s+(.+?)\s*$")
SECTION_RE = {
    "Spec version": re.compile(r"^\s*-\s*Spec version\s*:\s*(\S+)\s*$", re.IGNORECASE),
    "Scope": re.compile(r"^\s*-\s*Scope\s*$", re.IGNORECASE),
    "Files to touch": re.compile(r"^\s*-\s*Files to touch\s*$", re.IGNORECASE),
    "Implementation notes": re.compile(r"^\s*-\s*Implementation notes\s*$", re.IGNORECASE),
    "Verification": re.compile(r"^\s*-\s*Verification\s*$", re.IGNORECASE),
    "Evidence": re.compile(r"^\s*-\s*Evidence\s*$", re.IGNORECASE),
}

FILE_ITEM_RE = re.compile(r"^\s*-\s+[\w./-]+\.[A-Za-z0-9]+\s*$")
VER_COMMAND_RE = re.compile(r"^\s*-\s*Command\s*:\s*.+\S\s*$", re.IGNORECASE)
VER_EXPECT_RE = re.compile(r"^\s*-\s*Expected result\s*:\s*.+\S\s*$", re.IGNORECASE)

INDEX_CURRENT_RE = re.compile(r"^\s*Current\s*:\s*(\S+)\s*$", re.IGNORECASE)


def find_tasks(lines: List[str]) -> List[Tuple[int, str, str, str]]:
    tasks: List[Tuple[int, str, str, str]] = []
    for i, line in enumerate(lines):
        m = TASK_RE.match(line)
        if m:
            tasks.append((i, m.group(1), m.group(2), m.group(3)))
    return tasks


def get_block(lines: List[str], start: int, end: int) -> List[str]:
    return lines[start:end]


def find_current_spec(tasks_md_path: Path) -> Optional[str]:
    # Expect tasks at specs/<mvp>/tasks.md, index at specs/index.md
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


def has_section(block: List[str], name: str) -> bool:
    rx = SECTION_RE[name]
    return any(rx.match(x) for x in block)


def section_index(block: List[str], name: str) -> Optional[int]:
    rx = SECTION_RE[name]
    for i, x in enumerate(block):
        if rx.match(x):
            return i
    return None


def extract_spec_version(block: List[str]) -> Optional[str]:
    rx = SECTION_RE["Spec version"]
    for x in block:
        m = rx.match(x)
        if m:
            return m.group(1).strip()
    return None


def validate_task_block(
    tid: str,
    title: str,
    block: List[str],
    current_spec: Optional[str],
) -> List[str]:
    errs: List[str] = []

    if len(title.strip()) < 8:
        errs.append(f"{tid} title too short, make it specific")

    # Spec version required
    spec_v = extract_spec_version(block)
    if not spec_v:
        errs.append(f"{tid} missing Spec version line")
    elif current_spec and spec_v != current_spec:
        errs.append(f"{tid} Spec version mismatch, got {spec_v}, expected {current_spec}")

    # Required sections
    for sec in ["Scope", "Files to touch", "Implementation notes", "Verification", "Evidence"]:
        if not has_section(block, sec):
            errs.append(f"{tid} missing section: {sec}")

    # Files to touch should contain at least one file path soon after header
    fidx = section_index(block, "Files to touch")
    if fidx is not None:
        tail = block[fidx + 1 : fidx + 16]
        has_file = any(FILE_ITEM_RE.match(x) for x in tail)
        if not has_file:
            errs.append(f"{tid} Files to touch has no file paths")

    # Verification must include Command and Expected result lines
    vidx = section_index(block, "Verification")
    if vidx is not None:
        tail = block[vidx + 1 : vidx + 16]
        if not any(VER_COMMAND_RE.match(x) for x in tail):
            errs.append(f"{tid} Verification missing Command")
        if not any(VER_EXPECT_RE.match(x) for x in tail):
            errs.append(f"{tid} Verification missing Expected result")

    return errs


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_tasks.py <tasks.md>")
        return 2

    tasks_path = Path(sys.argv[1])
    if not tasks_path.exists():
        print(f"FAILED: file not found: {tasks_path}")
        return 2

    lines = tasks_path.read_text(encoding="utf-8").splitlines()
    tasks = find_tasks(lines)
    if not tasks:
        print("FAILED: no tasks found, expect '- [ ] T1 ...'")
        return 1

    current_spec = find_current_spec(tasks_path)
    if not current_spec:
        print("FAILED: cannot read specs/index.md Current field, required for MVP enforcement")
        print("Expected specs/index.md contains a line like 'Current: 01_mvp'")
        return 1

    all_errs: List[str] = []
    for i, (start, chk, tid, title) in enumerate(tasks):
        end = tasks[i + 1][0] if i + 1 < len(tasks) else len(lines)
        block = get_block(lines, start, end)
        all_errs.extend(validate_task_block(tid, title, block, current_spec))

    if all_errs:
        print("FAILED: tasks.md validation errors")
        for e in all_errs:
            print("-", e)
        return 1

    print(f"OK: tasks.md valid, Current spec is {current_spec}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
