#!/bin/bash
set -e

DATE=$(date +"%Y-%m-%d")
mkdir -p .agent/logs/diagnose

stop_pid() {
  NAME=$1
  PID_FILE=".agent/tmp/pids/$NAME.pid"
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    echo "Stopping $NAME (PID $PID)..."
    kill -TERM $PID || true
    sleep 2
    if kill -0 $PID 2>/dev/null; then
      kill -KILL $PID || true
    fi
    rm -f "$PID_FILE"
  fi
}

stop_port() {
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

stop_pid backend
stop_pid frontend
stop_port 3000
stop_port 5173

echo "{\"stopped_ports\":[3000,5173],\"date\":\"$DATE\"}" >> .agent/manifests/stop-run.json
echo "Stop manifest appended to .agent/manifests/stop-run.json"

LOG_FILE=".agent/logs/diagnose/stop-$DATE.log"
echo "Stopped backend/frontend and ports 3000/5173" >> "$LOG_FILE"
echo "Log written to $LOG_FILE"
