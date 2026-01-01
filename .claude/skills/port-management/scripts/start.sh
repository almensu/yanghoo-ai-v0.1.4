#!/bin/bash
set -e

LEVEL="1"
MODE="dev"
BACKEND_PORT="3000"
FRONTEND_PORT="5173"
FRONTEND_DIR="src/frontend"

while [ $# -gt 0 ]; do
  case "$1" in
    --level) LEVEL="$2"; shift 2 ;;
    --mode) MODE="$2"; shift 2 ;;
    --backend-port) BACKEND_PORT="$2"; shift 2 ;;
    --frontend-port) FRONTEND_PORT="$2"; shift 2 ;;
    --frontend-dir) FRONTEND_DIR="$2"; shift 2 ;;
    *) shift ;;
  esac
done

DATE=$(date +"%Y-%m-%d")
mkdir -p .agent/tmp/pids .agent/logs/{backend,frontend,diagnose} .agent/manifests

kill_port() {
  P="$1"
  PID=$(lsof -ti tcp:$P || true)
  if [ -n "$PID" ]; then
    kill -TERM $PID || true
    sleep 2
    if kill -0 $PID 2>/dev/null; then
      kill -KILL $PID || true
    fi
  fi
}

wait_for_port() {
  P="$1"
  TIMEOUT="${2:-30}"
  SECS=0
  until lsof -ti tcp:$P >/dev/null 2>&1; then
    sleep 1
    SECS=$((SECS+1))
    if [ "$SECS" -ge "$TIMEOUT" ]; then
      echo "timeout waiting for port $P" >> ".agent/logs/diagnose/start-$DATE.log"
      break
    fi
  done
}

kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

if [ "$LEVEL" = "1" ]; then
  if [ "$MODE" = "prod" ]; then
    nohup npm start > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
  else
    nohup npm run dev:backend > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
  fi
  BACKEND_PID=$!
  echo $BACKEND_PID > .agent/tmp/pids/backend.pid
  wait_for_port "$BACKEND_PORT" 60
  pushd "$FRONTEND_DIR" >/dev/null
  nohup npm run dev > "../../.agent/logs/frontend/frontend-$DATE.log" 2>&1 &
  FRONTEND_PID=$!
  popd >/dev/null
  echo $FRONTEND_PID > .agent/tmp/pids/frontend.pid
elif [ "$LEVEL" = "2" ]; then
  if command -v caddy >/dev/null 2>&1; then
    nohup caddy run > ".agent/logs/diagnose/caddy-$DATE.log" 2>&1 &
    echo $! > .agent/tmp/pids/caddy.pid
  fi
  if [ "$MODE" = "prod" ]; then
    nohup npm start > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
  else
    nohup npm run dev:backend > ".agent/logs/backend/backend-$DATE.log" 2>&1 &
  fi
  BACKEND_PID=$!
  echo $BACKEND_PID > .agent/tmp/pids/backend.pid
  pushd "$FRONTEND_DIR" >/dev/null
  nohup npm run dev > "../../.agent/logs/frontend/frontend-$DATE.log" 2>&1 &
  FRONTEND_PID=$!
  popd >/dev/null
  echo $FRONTEND_PID > .agent/tmp/pids/frontend.pid
elif [ "$LEVEL" = "3" ]; then
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    nohup docker compose up -d > ".agent/logs/diagnose/compose-$DATE.log" 2>&1 &
    echo $! > .agent/tmp/pids/compose.pid
  fi
fi

MANIFEST=".agent/manifests/port-management-start.json"
echo "{\"level\":\"$LEVEL\",\"mode\":\"$MODE\",\"backend_port\":\"$BACKEND_PORT\",\"frontend_port\":\"$FRONTEND_PORT\",\"backend_pid\":${BACKEND_PID:-0},\"frontend_pid\":${FRONTEND_PID:-0},\"date\":\"$DATE\"}" > "$MANIFEST"
echo "start manifest written" >> ".agent/logs/diagnose/start-$DATE.log"
