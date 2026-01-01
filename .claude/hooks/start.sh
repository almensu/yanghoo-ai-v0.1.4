#!/bin/bash
set -e

MODE=${1:-dev}
DATE=$(date +"%Y-%m-%d")

mkdir -p .agent/tmp/pids .agent/logs/{frontend,backend,diagnose}

# Kill processes on ports (3000 backend, 5173 frontend)
kill_port() {
  PORT=$1
  PID=$(lsof -ti tcp:$PORT || true)
  if [ -n "$PID" ]; then
    echo "Stopping process on port $PORT (PID $PID)..."
    kill -TERM $PID || true
    sleep 2
    if kill -0 $PID 2>/dev/null; then
      kill -KILL $PID || true
    fi
  fi
}

kill_port 3000
kill_port 5173

# Start backend
if [ "$MODE" = "prod" ]; then
  nohup npm start > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
else
  nohup npm run dev:backend > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
fi
BACKEND_PID=$!
echo $BACKEND_PID > .agent/tmp/pids/backend.pid
echo "Backend started (PID $BACKEND_PID)"

# Start frontend
pushd src/frontend >/dev/null
nohup npm run dev > "../../.agent/logs/frontend/frontend-$DATE.log" 2>&1 &
FRONTEND_PID=$!
popd >/dev/null
echo $FRONTEND_PID > .agent/tmp/pids/frontend.pid
echo "Frontend started (PID $FRONTEND_PID)"

echo "{\"mode\":\"$MODE\",\"backend_pid\":$BACKEND_PID,\"frontend_pid\":$FRONTEND_PID,\"date\":\"$DATE\"}" > .agent/manifests/start-run.json
echo "Start manifest written to .agent/manifests/start-run.json"
