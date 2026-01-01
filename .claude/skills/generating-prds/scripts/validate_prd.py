#!/usr/bin/env python3
import sys
import re

REQUIRED_HEADINGS = [
    r"^## 1 ",
    r"^## 2 ",
    r"^## 3 ",
    r"^## 4 ",
    r"^## 5 ",
    r"^## 6 ",
    r"^## 10 ",
    r"^## 11 ",
    r"^## 12 ",
    r"^## 13 ",
    r"^## 14 ",
]

def main(path: str) -> int:
    text = open(path, "r", encoding="utf-8").read()
    missing = []
    for pat in REQUIRED_HEADINGS:
        if not re.search(pat, text, flags=re.MULTILINE):
            missing.append(pat)

    if missing:
        print("FAILED: missing required sections")
        for m in missing:
            print(f"- {m}")
        return 1

    if "验收标准" not in text:
        print("FAILED: missing acceptance criteria keyword 验收标准")
        return 1

    print("OK: structure looks valid")
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: validate_prd.py <prd.md>")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
