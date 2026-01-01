#!/usr/bin/env python3
"""
微信分享卡片服务器启动脚本
自动启动本地服务器，处理端口占用问题
"""

import os
import sys
import time
import socket
import subprocess
import signal
from pathlib import Path

def is_port_available(port):
    """检查端口是否可用"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return True
        except OSError:
            return False

def find_available_port(start_port=8000):
    """找到可用端口"""
    for port in range(start_port, start_port + 10):
        if is_port_available(port):
            return port
    raise RuntimeError("无法找到可用端口")

def start_server(port=8000):
    """启动本地 HTTP 服务器"""
    # 确保在正确的目录中
    skill_dir = Path(__file__).parent.parent
    original_dir = os.getcwd()

    try:
        os.chdir(skill_dir)

        # 检查必要的文件是否存在
        if not Path("local-images.html").exists():
            # 如果不存在，从 wechat-share-card 复制文件
            source_dir = skill_dir.parent / "wechat-share-card"
            import shutil

            required_files = [
                "local-images.html",
                "start-server.sh",
                "start-server.bat",
                "README.md"
            ]

            for file in required_files:
                src = source_dir / file
                dst = skill_dir / file
                if src.exists() and not dst.exists():
                    shutil.copy2(src, dst)

            # 复制 references 文件夹
            refs_src = source_dir / "references"
            refs_dst = skill_dir / "references"
            if refs_src.exists() and not refs_dst.exists():
                shutil.copytree(refs_src, refs_dst)

        # 启动服务器
        server_process = subprocess.Popen([
            sys.executable, "-m", "http.server", str(port)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # 等待服务器启动
        time.sleep(2)

        # 检查服务器是否成功启动
        if server_process.poll() is None:
            return server_process, port
        else:
            raise RuntimeError("服务器启动失败")

    except Exception as e:
        os.chdir(original_dir)
        raise e
    finally:
        os.chdir(original_dir)

def stop_server(server_process):
    """停止服务器"""
    if server_process:
        server_process.terminate()
        server_process.wait(timeout=5)

if __name__ == "__main__":
    try:
        print("🚀 启动微信分享卡片服务器...")

        # 查找可用端口
        port = find_available_port()
        print(f"📡 使用端口: {port}")

        # 启动服务器
        process, port = start_server(port)
        print(f"✅ 服务器已启动: http://localhost:{port}")
        print(f"🌐 访问地址: http://localhost:{port}/local-images.html")

        # 保持服务运行
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 正在停止服务器...")
            stop_server(process)
            print("✅ 服务器已停止")

    except Exception as e:
        print(f"❌ 错误: {e}")
        sys.exit(1)