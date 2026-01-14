#!/bin/bash

# 启动脚本：同时启动后端（FastAPI）和前端（React）
# 后端日志: backend.log  前端日志: frontend.log
# 后端端口: 8000  前端端口: 3000

set -e

# 获取脚本所在的绝对路径，作为项目根目录
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查 uv 是否已安装
if ! command -v uv &> /dev/null; then
    echo "[错误] uv 未安装。请先安装 uv："
    echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo "  或参考: https://github.com/astral-sh/uv"
    exit 1
fi

echo "[信息] uv 已确认: $(uv --version)"

# --- 关闭占用端口的现有服务 ---
echo "[信息] 检查并关闭占用端口的现有服务..."

# 关闭占用 8000 端口的进程 (后端)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[后端] 端口 8000 被占用，正在关闭..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "[后端] 端口 8000 已释放"
else
    echo "[后端] 端口 8000 未被占用"
fi

# 关闭占用 3000 端口的进程 (前端)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[前端] 端口 3000 被占用，正在关闭..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "[前端] 端口 3000 已释放"
else
    echo "[前端] 端口 3000 未被占用"
fi

# --- Python Dependencies (使用 uv sync) ---
echo "[Python] 同步依赖 (从 ${PROJECT_ROOT})..."
if [ -f "${PROJECT_ROOT}/pyproject.toml" ]; then
    cd "${PROJECT_ROOT}"
    uv sync
    echo "[Python] 依赖同步完成。"
else
    echo "[错误] pyproject.toml 未在 ${PROJECT_ROOT} 找到。"
    exit 1
fi

# 1. 启动后端
echo "[后端] Starting backend..."
# pgrep pattern for uvicorn with --reload
if pgrep -f "uvicorn src.main:app --reload" > /dev/null; then
    echo "[后端] uvicorn with --reload already running."
else
    echo "[后端] Starting uvicorn (src.main:app --reload) with uv..."
    # 使用 uv run 启动后端
    (cd "${PROJECT_ROOT}/backend" && nohup uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > "${PROJECT_ROOT}/backend.log" 2>&1 &)
    echo "[后端] uvicorn started with --reload. Log: ${PROJECT_ROOT}/backend.log"
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

# 等待服务启动
echo "[信息] 等待服务启动..."
sleep 8

# 自动打开监控页面
echo "[信息] 打开浏览器监控页面..."
open "http://localhost:3000/monitor.html"
sleep 2

echo "--- Startup initiated ---"
echo "Backend log: ${PROJECT_ROOT}/backend.log"
echo "Frontend log: ${PROJECT_ROOT}/frontend.log"
echo "Access Frontend: http://localhost:3000/"
echo "Access Backend: http://localhost:8000/docs" 