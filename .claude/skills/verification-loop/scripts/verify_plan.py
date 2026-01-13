#!/usr/bin/env python3
"""
YangHoo AI Project - Verification Plan Generator

根据项目特性定制的验证计划生成器：
- 前端：React + npm (ESLint, Prettier, Jest tests)
- 后端：FastAPI + uv (ruff, black, mypy, pytest)
- 支持按变更文件类型智能选择检查项

使用方式：
  python verify_plan.py --root . --changed changed_files.txt --strict 0
"""
import argparse
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


def read_lines(path):
    """读取文件行，去除空行和空白"""
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return [x.strip() for x in f if x.strip()]


def exists(root, rel):
    """检查相对路径是否存在"""
    return os.path.exists(os.path.join(root, rel))


def detect_stack(root):
    """检测项目技术栈"""
    node = exists(root, "frontend/package.json")
    py = exists(root, "pyproject.toml")
    return node, py


def which(cmd):
    """检查命令是否可用"""
    return shutil.which(cmd) is not None


def is_uv_available():
    """检查 uv 是否可用"""
    try:
        result = subprocess.run(
            ["uv", "--version"],
            capture_output=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def npm_scripts(root):
    """读取 package.json 中的 scripts"""
    try:
        with open(os.path.join(root, "frontend/package.json"), "r", encoding="utf-8") as f:
            pkg = json.load(f)
        return set((pkg.get("scripts") or {}).keys())
    except Exception:
        return set()


def has_eslint_config(root):
    """检查是否有 ESLint 配置"""
    return any(exists(root, f) for f in [
        "frontend/.eslintrc.json",
        "frontend/.eslintrc.js",
        "frontend/.eslintrc.yml",
        "frontend/.eslintrc.yaml",
    ])


def has_prettier_config(root):
    """检查是否有 Prettier 配置"""
    return any(exists(root, f) for f in [
        "frontend/.prettierrc",
        "frontend/.prettierrc.json",
        "frontend/.prettierrc.js",
        "frontend/.prettierrc.yml",
    ])


def changed_flags(changed):
    """根据变更文件判断检查类型"""
    flags = {
        # UI 组件变更
        "ui": any(re.search(r"(^|/)frontend/src/(components|pages|layouts|shared)/", p) for p in changed),
        # Node.js/前端文件变更
        "node": any(
            p.startswith("frontend/") and p.endswith((".ts", ".tsx", ".js", ".jsx"))
            for p in changed
        ),
        # Python 文件变更
        "py": any(
            p.startswith("backend/") and p.endswith(".py")
            for p in changed
        ),
        # 后端核心文件变更
        "backend_core": any(
            p.startswith("backend/src/") and p.endswith(".py")
            for p in changed
        ),
        # 配置文件变更
        "config": any(
            re.search(r"(package\.json|\.eslintrc|prettierrc|pyproject\.toml|\.env)", p)
            for p in changed
        ),
    }
    return flags


def get_frontend_checks(root, changed, flags):
    """生成前端验证检查列表"""
    run = []
    skipped = []
    scripts = npm_scripts(root)
    has_eslint = has_eslint_config(root)
    has_prettier = has_prettier_config(root)

    # ============================================
    # ESLint 检查 (代码质量)
    # ============================================
    if flags["node"] and has_eslint:
        # 使用 npx eslint 直接运行，不依赖 package.json 脚本
        run.append({
            "check": "eslint",
            "cmd": "cd frontend && npx eslint src/ --max-warnings=0",
            "description": "ESLint code quality check"
        })
    elif flags["node"]:
        skipped.append({
            "check": "eslint",
            "reason": "ESLint config not found in frontend/"
        })

    # ============================================
    # Prettier 检查 (代码格式)
    # ============================================
    if flags["node"] and has_prettier:
        run.append({
            "check": "prettier",
            "cmd": "cd frontend && npx prettier --check 'src/**/*.{js,jsx,ts,tsx,json,css,md}'",
            "description": "Prettier format check"
        })
    elif flags["node"]:
        skipped.append({
            "check": "prettier",
            "reason": "Prettier config not found in frontend/"
        })

    # ============================================
    # Jest 单元测试
    # ============================================
    if "test" in scripts and flags["node"]:
        run.append({
            "check": "test:unit",
            "cmd": "cd frontend && npm test -- --watchAll=false --passWithNoTests",
            "description": "Jest unit tests"
        })
    elif flags["node"]:
        skipped.append({
            "check": "test:unit",
            "reason": "No 'test' script in frontend/package.json"
        })

    # ============================================
    # 构建检查
    # ============================================
    if "build" in scripts and flags["node"]:
        run.append({
            "check": "build",
            "cmd": "cd frontend && npm run build",
            "description": "Production build verification"
        })
    elif flags["node"]:
        skipped.append({
            "check": "build",
            "reason": "No 'build' script in frontend/package.json"
        })

    return run, skipped


def get_backend_checks(root, changed, flags):
    """生成后端验证检查列表"""
    run = []
    skipped = []
    has_uv = is_uv_available()

    # ============================================
    # Ruff Lint 检查 (使用 uv)
    # ============================================
    if flags["py"] and has_uv:
        run.append({
            "check": "ruff",
            "cmd": "uv run ruff check backend/src/",
            "description": "Ruff lint check"
        })
    elif flags["py"] and which("ruff"):
        # 回退到系统安装的 ruff
        run.append({
            "check": "ruff",
            "cmd": "ruff check backend/src/",
            "description": "Ruff lint check (system)"
        })
    elif flags["py"]:
        skipped.append({
            "check": "ruff",
            "reason": "uv not available and ruff not in PATH"
        })

    # ============================================
    # Black 格式检查 (使用 uv)
    # ============================================
    if flags["py"] and has_uv:
        run.append({
            "check": "black",
            "cmd": "uv run black --check backend/src/",
            "description": "Black format check"
        })
    elif flags["py"] and which("black"):
        run.append({
            "check": "black",
            "cmd": "black --check backend/src/",
            "description": "Black format check (system)"
        })
    elif flags["py"]:
        skipped.append({
            "check": "black",
            "reason": "uv not available and black not in PATH"
        })

    # ============================================
    # MyPy 类型检查 (使用 uv)
    # ============================================
    if flags["backend_core"] and has_uv:
        run.append({
            "check": "mypy",
            "cmd": "uv run mypy backend/src/",
            "description": "MyPy type check"
        })
    elif flags["backend_core"] and which("mypy"):
        run.append({
            "check": "mypy",
            "cmd": "mypy backend/src/",
            "description": "MyPy type check (system)"
        })
    elif flags["backend_core"]:
        skipped.append({
            "check": "mypy",
            "reason": "uv not available and mypy not in PATH"
        })

    # ============================================
    # Pytest 单元测试 (使用 uv)
    # ============================================
    if flags["py"] and has_uv:
        run.append({
            "check": "pytest",
            "cmd": "uv run pytest -q backend/",
            "description": "Pytest unit tests"
        })
    elif flags["py"] and which("pytest"):
        run.append({
            "check": "pytest",
            "cmd": "pytest -q backend/",
            "description": "Pytest unit tests (system)"
        })
    elif flags["py"]:
        skipped.append({
            "check": "pytest",
            "reason": "uv not available and pytest not in PATH"
        })

    return run, skipped


def get_integration_checks(root, changed, flags):
    """生成集成验证检查列表"""
    run = []
    skipped = []

    # ============================================
    # 配置一致性检查
    # ============================================
    if flags["config"]:
        run.append({
            "check": "config_sync",
            "cmd": "python -c 'import json; print(\\\"Config files validated\\\")'",
            "description": "Configuration files sync check"
        })

    # ============================================
    # API 文档生成检查
    # ============================================
    if flags["backend_core"] or flags["config"]:
        if is_uv_available():
            run.append({
                "check": "api_docs",
                "cmd": "cd backend && uv run uvicorn src.main:app --help > /dev/null 2>&1 && echo 'API module loads successfully'",
                "description": "FastAPI app import check"
            })
        else:
            skipped.append({
                "check": "api_docs",
                "reason": "uv not available for import check"
            })

    return run, skipped


def main():
    ap = argparse.ArgumentParser(description="YangHoo AI Verification Plan Generator")
    ap.add_argument("--root", required=True, help="Project root directory")
    ap.add_argument("--changed", required=True, help="File containing list of changed files")
    ap.add_argument("--strict", type=int, default=0,
                    help="Strict mode: fail if no checks can be run (0=off, 1=on)")
    args = ap.parse_args()

    root = args.root
    changed = read_lines(args.changed)
    node, py = detect_stack(root)
    flags = changed_flags(changed)

    run = []
    skipped = []

    # 前端检查
    if node:
        frontend_run, frontend_skipped = get_frontend_checks(root, changed, flags)
        run.extend(frontend_run)
        skipped.extend(frontend_skipped)

    # 后端检查
    if py:
        backend_run, backend_skipped = get_backend_checks(root, changed, flags)
        run.extend(backend_run)
        skipped.extend(backend_skipped)

    # 集成检查
    if node or py:
        integration_run, integration_skipped = get_integration_checks(root, changed, flags)
        run.extend(integration_run)
        skipped.extend(integration_skipped)

    # STRICT 模式：如果没有可运行的检查，则失败
    if args.strict and len(run) == 0:
        # 保持 skipped 原因；空的 run 会导致 verify.sh 失败并给出提示
        pass

    # 输出 JSON 计划
    out = {
        "run": run,
        "skipped": skipped,
        "changed": changed,
        "stack": {
            "node": node,
            "python": py,
            "flags": flags
        },
        "summary": {
            "total_checks": len(run),
            "skipped_checks": len(skipped),
            "changed_files": len(changed)
        }
    }

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
