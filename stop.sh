#!/bin/bash

# 停止脚本：同时停止后端（FastAPI）和前端（React）

set -e

echo "[信息] Attempting to stop backend and frontend services..."

# 1. 停止后端 (uvicorn)
echo "[后端] Stopping backend (uvicorn)..."
# The pattern should match what's used in start.sh's pgrep and nohup command
# pgrep -f "uvicorn src.main:app --reload"
# nohup $PYTHON -m uvicorn src.main:app --reload ...
if pgrep -f "uvicorn src.main:app --reload" > /dev/null; then
    pkill -f "uvicorn src.main:app --reload"
    echo "[后端] uvicorn (src.main:app --reload) processes terminated."
else
    echo "[后端] uvicorn (src.main:app --reload) not found running."
fi

# 2. 停止前端 (React - npm start)
echo "[前端] Stopping frontend (React/npm start)..."
# The pattern should match what's used in start.sh's pgrep and nohup command
# pgrep -f "react-scripts start"
# nohup npm start ...
# npm start usually spawns a node process with react-scripts start
if pgrep -f "react-scripts start" > /dev/null; then
    pkill -f "react-scripts start"
    echo "[前端] React frontend (react-scripts start) processes terminated."
else
    echo "[前端] React frontend (react-scripts start) not found running."
fi

# It's also good practice to kill the parent `npm start` or `node` processes if they linger.
# However, `pkill -f "react-scripts start"` should get the direct process.
# If there are orphaned node processes related to the frontend, a more general
# pkill targeting node processes started from the frontend directory might be needed,
# but can be risky if other node apps are running.
# For now, the above is a direct parallel to the start script's check.

echo "--- Shutdown initiated ---"
echo "If processes were running, they should now be stopped."
echo "You can verify by checking for their absence in process lists (e.g., ps aux | grep uvicorn)." 