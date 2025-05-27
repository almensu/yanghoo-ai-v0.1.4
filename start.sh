#!/bin/bash

# 启动脚本：同时启动后端（FastAPI）和前端（React）
# 后端日志: backend.log  前端日志: frontend.log
# 后端端口: 8000  前端端口: 3000

set -e

# 获取脚本所在的绝对路径，作为项目根目录
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查 conda 环境
# 确保只激活了 auto_ai_subtitle-v0.0.9
EXPECTED_CONDA_ENV="auto_ai_subtitle-v0.0.9"

# 检查 CONDA_DEFAULT_ENV 是否设置
if [ -z "${CONDA_DEFAULT_ENV}" ]; then
    echo "[错误] 未激活任何 conda 环境。请先执行 'conda activate ${EXPECTED_CONDA_ENV}'。"
    exit 1
fi

# 检查当前激活的环境是否为期望的环境
if [ "${CONDA_DEFAULT_ENV}" != "${EXPECTED_CONDA_ENV}" ]; then
    echo "[错误] 当前激活的 conda 环境是 '${CONDA_DEFAULT_ENV}'，但期望的是 '${EXPECTED_CONDA_ENV}'。"
    echo "请先执行 'conda activate ${EXPECTED_CONDA_ENV}'。"
    exit 1
fi

# 进一步检查嵌套环境 (查看 CONDA_PREFIX 是否只指向期望的环境)
# CONDA_PREFIX_1 通常是 base, CONDA_PREFIX 是最内层激活的环境
# 如果 CONDA_SHLVL > 1 并且 CONDA_PREFIX_1 (或类似的变量，取决于conda版本和shell) 指向 base，
# 并且 CONDA_DEFAULT_ENV 是期望的环境，可能说明是 base -> desired_env 的嵌套
# 一个更简单的方法是检查 CONDA_PROMPT_MODIFIER, 如果它包含 (base) 和 (desired_env)
# 不过 CONDA_PROMPT_MODIFIER 不总是可靠或存在。 CONDA_SHLVL 是个好指标。

if [ "${CONDA_SHLVL}" -gt 1 ]; then
  # 获取基础环境的名称，通常 CONDA_PREFIX_<SHLVL-1> 会是 base
  # 这有点复杂，因为变量名依赖于 SHLVL。
  # 一个间接的检查方法是看 CONDA_PREFIX 是否 *不* 包含 'base' 路径，如果它是正确的独立环境。
  # 或者，如果 CONDA_EXE 路径中的 envs 目录直接是 EXPECTED_CONDA_ENV
  if [[ "${CONDA_PREFIX}" == *"/envs/base/envs/"* || "${CONDA_PREFIX}" != *"/envs/${EXPECTED_CONDA_ENV}"* ]]; then
    # 这个检测逻辑可能需要根据实际的 conda 版本和配置进行微调
    # 基本思想是，如果 CONDA_SHLVL > 1，我们不希望 base 环境是任何父环境。
    # 如果 CONDA_PREFIX (最内层) 不是直接的 EXPECTED_CONDA_ENV 路径，而是嵌套在 base 下，则有问题。
    # 例如 /path/to/conda/envs/base/envs/auto_ai_subtitle-v0.0.9 就是不希望的
    # 期望的是 /path/to/conda/envs/auto_ai_subtitle-v0.0.9

    # 更简单粗暴的检查，如果 shell prompt 提示符同时有 (base) 和 (auto_ai_subtitle-v0.0.9)
    # 这依赖于 PS1 的设置，可能不通用
    current_prompt=${PS1:-}
    if [[ "${current_prompt}" == *"(base)"* && "${current_prompt}" == *"(${EXPECTED_CONDA_ENV})"* ]]; then
        echo "[错误] 检测到 conda 环境 '${EXPECTED_CONDA_ENV}' 可能嵌套在 '(base)' 环境中。"
        echo "请确保只独立激活 '${EXPECTED_CONDA_ENV}'，例如："
        echo "  conda deactivate  # (可能需要多次，直到回到 base 或无 conda 环境)"
        echo "  conda activate ${EXPECTED_CONDA_ENV}"
        exit 1
    fi
    # 如果 PS1 不可靠，可以尝试检查 CONDA_PREFIX 是否是 /path/to/miniconda3/envs/auto_ai_subtitle-v0.0.9
    # 而不是 /path/to/miniconda3/envs/base/envs/auto_ai_subtitle-v0.0.9
    # 这需要知道 conda 的安装路径，或者假设它在常见的路径
    # 如果 CONDA_PREFIX 包含 "envs/base/envs", 那么很有可能是嵌套的
    if [[ "$CONDA_PREFIX" == *"envs/base/envs/"* ]]; then
        echo "[错误] 检测到 conda 环境 '${EXPECTED_CONDA_ENV}' 嵌套在 '(base)' 环境中 (路径: ${CONDA_PREFIX})。"
        echo "请确保只独立激活 '${EXPECTED_CONDA_ENV}'。"
        exit 1
    fi
  fi

  echo "[警告] Conda shell level (CONDA_SHLVL) is ${CONDA_SHLVL}. Your environment '${EXPECTED_CONDA_ENV}' might be nested."
  echo "Proceeding, but ensure '${EXPECTED_CONDA_ENV}' is the primary active environment without 'base' underneath."
fi

echo "[信息] Conda 环境 '${CONDA_DEFAULT_ENV}' 已确认。"

PYTHON=python3

# --- Python Dependencies (from project root) ---
echo "[Python] 检查/安装依赖 (从 ${PROJECT_ROOT})..."
if [ -f "${PROJECT_ROOT}/requirements.txt" ]; then
    $PYTHON -m pip install --upgrade pip
    $PYTHON -m pip install -r "${PROJECT_ROOT}/requirements.txt"
else
    echo "[Python] requirements.txt 未在 ${PROJECT_ROOT} 找到。"
fi

# 1. 启动后端
echo "[后端] Starting backend..."
# pgrep pattern updated for src.main:app and --reload
if pgrep -f "uvicorn src.main:app --reload" > /dev/null; then
    echo "[后端] uvicorn with --reload already running."
else
    echo "[后端] Starting uvicorn (src.main:app --reload)..."
    # Execute in a subshell after cd
    (cd "${PROJECT_ROOT}/backend" && nohup $PYTHON -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > "${PROJECT_ROOT}/backend.log" 2>&1 &)
    echo "[后端] uvicorn started with --reload. Log: ${PROJECT_ROOT}/backend.log (PID may be for subshell)"
fi

# 2. 启动前端
echo "[前端] Starting frontend..."
# Node.js dependencies (run npm install from frontend directory)
if [ ! -d "${PROJECT_ROOT}/frontend/node_modules" ]; then
    echo "[前端] node_modules not found in ${PROJECT_ROOT}/frontend. Installing dependencies..."
    (cd "${PROJECT_ROOT}/frontend" && npm install)
fi

if pgrep -f "react-scripts start" > /dev/null; then
    echo "[前端] React frontend already running."
else
    echo "[前端] Starting React frontend (npm start)..."
    # Execute in a subshell after cd
    (cd "${PROJECT_ROOT}/frontend" && nohup npm start > "${PROJECT_ROOT}/frontend.log" 2>&1 &)
    echo "[前端] React frontend started. Log: ${PROJECT_ROOT}/frontend.log (PID may be for subshell)"
fi

echo "--- Startup initiated ---"
echo "Backend log: ${PROJECT_ROOT}/backend.log"
echo "Frontend log: ${PROJECT_ROOT}/frontend.log"
echo "Access Frontend: http://localhost:3000/" 
echo "Access Backend: http://localhost:8000/docs" 