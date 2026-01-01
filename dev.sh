#!/bin/bash

# 开发模式启动脚本：使用 tmux 分屏实时监控前后端日志
# 上窗：后端日志 (蓝色标题) | 下窗：前端日志 (绿色标题)

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查 tmux 是否已安装
if ! command -v tmux &> /dev/null; then
    echo "[错误] tmux 未安装。请先安装 tmux："
    echo "  macOS: brew install tmux"
    echo "  或参考: https://github.com/tmux/tmux"
    exit 1
fi

SESSION_NAME="yanghoo-dev"

# 检查并关闭占用端口的现有服务
echo "[信息] 检查并关闭占用端口的现有服务..."

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[后端] 端口 8000 被占用，正在关闭..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "[前端] 端口 3000 被占用，正在关闭..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 同步 Python 依赖
echo "[Python] 同步依赖..."
cd "${PROJECT_ROOT}"
uv sync

# 启动后端
echo "[后端] Starting backend..."
(cd "${PROJECT_ROOT}/backend" && nohup uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > "${PROJECT_ROOT}/backend.log" 2>&1 &)

# 启动前端
echo "[前端] Starting frontend..."
if [ ! -d "${PROJECT_ROOT}/frontend/node_modules" ]; then
    (cd "${PROJECT_ROOT}/frontend" && npm install)
fi
(cd "${PROJECT_ROOT}/frontend" && nohup npm start > "${PROJECT_ROOT}/frontend.log" 2>&1 &)

# 等待服务启动（前端需要更长时间编译）
echo "[信息] 等待服务启动..."
sleep 8

# 自动打开检测页面和应用
echo "[信息] 打开浏览器..."
open "http://localhost:3000/dev-check.html"
sleep 2
open "http://localhost:3000/"

# 启动 tmux 会话
echo ""
echo "=========================================="
echo "  开发环境已启动 - tmux 分屏监控"
echo "=========================================="
echo "后端: http://localhost:8000/docs"
echo "前端: http://localhost:3000/"
echo ""
echo "tmux 操作提示:"
echo "  Ctrl+B 然后 ↑/↓ - 切换窗口"
echo "  Ctrl+B 然后 [   - 进入复制模式（可滚动）"
echo "  Ctrl+B 然后 q   - 退出复制模式"
echo "  Ctrl+B 然后 d   - 分离会话（后台运行）"
echo "  tmux attach -t $SESSION_NAME - 重新连接"
echo "=========================================="
echo ""

# 创建 tmux 会话
tmux new-session -d -s "$SESSION_NAME"

# 分割窗口（上下分屏）
tmux split-window -v -t "$SESSION_NAME"

# 上窗：后端日志（蓝色标题，高亮 API/ERROR/INFO）
tmux select-pane -t "$SESSION_NAME:0.0" -T "🔧 Backend :8000"
tmux send-keys -t "$SESSION_NAME:0.0" "tail -f ${PROJECT_ROOT}/backend.log | grep --line-buffered -E '.*|$' | GREP_COLOR='1;34' grep --line-buffered -E 'GET|POST|PUT|DELETE|\[INFO\]|ERROR|WARNING' --color=always || tail -f ${PROJECT_ROOT}/backend.log" Enter

# 下窗：前端日志（绿色标题，高亮 Compiled/Error/Warn）
tmux select-pane -t "$SESSION_NAME:0.1" -T "⚛️  Frontend :3000"
tmux send-keys -t "$SESSION_NAME:0.1" "tail -f ${PROJECT_ROOT}/frontend.log | grep --line-buffered -E '.*|$' | GREP_COLOR='1;32' grep --line-buffered -E 'Compiled|webpack|Local:|On Your Network|ERROR|WARN' --color=always || tail -f ${PROJECT_ROOT}/frontend.log" Enter

# 启用状态栏显示窗格标题
tmux set-option -t "$SESSION_NAME" pane-border-status top
tmux set-option -t "$SESSION_NAME" pane-border-format "#{pane_title}"

# 连接到会话
tmux attach-session -t "$SESSION_NAME"
