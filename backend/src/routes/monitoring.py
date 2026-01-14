"""
日志监控 API 端点
提供实时日志流、服务状态和统计信息
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from typing import Dict
import asyncio
import json
from pathlib import Path
import os

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

# 日志文件路径
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
BACKEND_LOG = PROJECT_ROOT / "backend.log"
FRONTEND_LOG = PROJECT_ROOT / "frontend.log"


class LogStreamer:
    """日志流管理器"""

    def __init__(self, log_path: Path):
        self.log_path = log_path
        self.last_position = 0
        if log_path.exists():
            self.last_position = log_path.stat().st_size

    async def read_new_lines(self):
        """读取新增的日志行"""
        if not self.log_path.exists():
            return []

        current_size = self.log_path.stat().st_size

        if current_size < self.last_position:
            # 日志被轮转，从头开始
            self.last_position = 0

        if current_size == self.last_position:
            return []

        with open(self.log_path, 'r', encoding='utf-8', errors='ignore') as f:
            f.seek(self.last_position)
            lines = f.readlines()
            self.last_position = f.tell()

        return lines


# WebSocket 连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()
backend_streamer = LogStreamer(BACKEND_LOG)
frontend_streamer = LogStreamer(FRONTEND_LOG)


@router.get("/status")
async def get_status() -> Dict:
    """获取服务状态"""
    import subprocess

    # 检查后端
    backend_running = False
    try:
        result = subprocess.run(
            ["lsof", "-Pi", ":8000", "-sTCP:LISTEN", "-t"],
            capture_output=True,
            text=True
        )
        backend_running = bool(result.stdout.strip())
    except:
        pass

    # 检查前端
    frontend_running = False
    try:
        result = subprocess.run(
            ["lsof", "-Pi", ":3000", "-sTCP:LISTEN", "-t"],
            capture_output=True,
            text=True
        )
        frontend_running = bool(result.stdout.strip())
    except:
        pass

    # 统计日志信息
    backend_lines = 0
    frontend_lines = 0
    backend_errors = 0
    frontend_errors = 0

    if BACKEND_LOG.exists():
        with open(BACKEND_LOG, 'r') as f:
            backend_lines = sum(1 for _ in f)
        with open(BACKEND_LOG, 'r') as f:
            backend_errors = sum(1 for line in f if 'ERROR' in line or 'Exception' in line)

    if FRONTEND_LOG.exists():
        with open(FRONTEND_LOG, 'r') as f:
            frontend_lines = sum(1 for _ in f)
        with open(FRONTEND_LOG, 'r') as f:
            frontend_errors = sum(1 for line in f if 'ERROR' in line or 'Failed' in line)

    return {
        "backend": {
            "running": backend_running,
            "url": "http://localhost:8000",
            "log_exists": BACKEND_LOG.exists(),
            "log_lines": backend_lines,
            "error_count": backend_errors
        },
        "frontend": {
            "running": frontend_running,
            "url": "http://localhost:3000",
            "log_exists": FRONTEND_LOG.exists(),
            "log_lines": frontend_lines,
            "error_count": frontend_errors
        }
    }


@router.get("/logs/{service}")
async def get_logs(service: str, tail: int = 100):
    """获取最近的日志行"""
    if service == "backend":
        log_path = BACKEND_LOG
    elif service == "frontend":
        log_path = FRONTEND_LOG
    else:
        return {"error": "Invalid service"}

    if not log_path.exists():
        return {"lines": []}

    lines = []
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        all_lines = f.readlines()
        lines = all_lines[-tail:] if len(all_lines) > tail else all_lines

    return {
        "service": service,
        "lines": [{"line": line.strip(), "type": detect_log_type(line)} for line in lines]
    }


def detect_log_type(line: str) -> str:
    """检测日志类型"""
    line_upper = line.upper()
    if 'ERROR' in line_upper or 'EXCEPTION' in line_upper or 'TRACEBACK' in line_upper:
        return 'error'
    elif 'WARNING' in line_upper or 'WARN' in line_upper:
        return 'warning'
    elif 'INFO' in line_upper or 'GET' in line or 'POST' in line or 'PUT' in line or 'DELETE' in line:
        return 'info'
    elif 'COMPILED' in line_upper or 'WEBPACK' in line_upper:
        return 'success'
    else:
        return 'default'


@router.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    """WebSocket 日志流"""
    await manager.connect(websocket)
    try:
        while True:
            # 读取新日志
            backend_lines = await backend_streamer.read_new_lines()
            frontend_lines = await frontend_streamer.read_new_lines()

            # 发送后端日志
            for line in backend_lines:
                await websocket.send_json({
                    "service": "backend",
                    "line": line.strip(),
                    "type": detect_log_type(line)
                })

            # 发送前端日志
            for line in frontend_lines:
                await websocket.send_json({
                    "service": "frontend",
                    "line": line.strip(),
                    "type": detect_log_type(line)
                })

            # 发送心跳
            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/logs/clear")
async def clear_logs(service: str = None):
    """清空日志文件"""
    if service == "backend" or service is None:
        if BACKEND_LOG.exists():
            open(BACKEND_LOG, 'w').close()
            backend_streamer.last_position = 0

    if service == "frontend" or service is None:
        if FRONTEND_LOG.exists():
            open(FRONTEND_LOG, 'w').close()
            frontend_streamer.last_position = 0

    return {"status": "cleared"}
