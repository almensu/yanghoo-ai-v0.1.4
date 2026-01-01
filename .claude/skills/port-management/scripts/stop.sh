#!/bin/bash
set -e

LEVEL="1"
BACKEND_PORT="3000"
FRONTEND_PORT="5173"

while [ $# -gt 0 ]; do
  case "$1" in
    --level) LEVEL="$2"; shift 2 ;;
    --backend-port) BACKEND_PORT="$2"; shift 2 ;;
    --frontend-port) FRONTEND_PORT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

DATE=$(date +"%Y-%m-%d")
mkdir -p .agent/logs/diagnose .agent/manifests

stop_pid() {
  F="$1"
  if [ -f "$F" ]; then
    PID=$(cat "$F")
    kill -TERM $PID || true
    sleep 2
    if kill -0 $PID 2>/dev/null; then
      kill -KILL $PID || true
    fi
    rm -f "$F"
  fi
}

stop_port() {
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

stop_pid ".agent/tmp/pids/backend.pid"
stop_pid ".agent/tmp/pids/frontend.pid"
stop_pid ".agent/tmp/pids/caddy.pid"
stop_pid ".agent/tmp/pids/compose.pid"

stop_port "$BACKEND_PORT"
stop_port "$FRONTEND_PORT"

if [ "$LEVEL" = "3" ]; then
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    docker compose down >> ".agent/logs/diagnose/compose-$DATE.log" 2>&1 || true
  fi
fi

LOG_FILE=".agent/logs/diagnose/stop-$DATE.log"
echo "stopped level=$LEVEL ports=$BACKEND_PORT,$FRONTEND_PORT" >> "$LOG_FILE"
echo "{\"level\":\"$LEVEL\",\"backend_port\":\"$BACKEND_PORT\",\"frontend_port\":\"$FRONTEND_PORT\",\"date\":\"$DATE\"}" >> ".agent/manifests/port-management-stop.json"
