#!/usr/bin/env python3
import sys
import re
from pathlib import Path

REQUIRED = [
    "## 1",
    "## 2",
    "## 3",
    "## 4",
    "## 5",
    "## 6",
    "## 10",
    "## 11",
    "## 12",
    "## 13",
    "## 14",
    "## 15",
    "## 16",
]

KEYWORDS = [
    "SLO",
    "灰度",
    "回滚",
    "风险",
    "开放问题",
    "假设",
]

def main(path: str) -> int:
    text = Path(path).read_text(encoding="utf-8")

    missing = []
    for h in REQUIRED:
        if h not in text:
            missing.append(h)

    if missing:
        print("FAILED: missing required headings")
        for h in missing:
            print("-", h)
        return 1

    missing_kw = [k for k in KEYWORDS if k not in text]
    if missing_kw:
        print("FAILED: missing key topics")
        for k in missing_kw:
            print("-", k)
        return 1

    if not re.search(r"```mermaid", text):
        print("FAILED: missing mermaid diagrams")
        return 1

    print("OK: architecture doc looks valid")
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: validate_architecture.py <architecture.md>")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
