#!/bin/bash

# YangHoo AI 实时监控脚本
# 功能：彩色终端、前后端分屏、错误高亮、状态指示

set -e

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 颜色定义
readonly COLOR_RESET='\033[0m'
readonly COLOR_BACKEND='\033[1;34m'    # 蓝色
readonly COLOR_FRONTEND='\033[1;32m'   # 绿色
readonly COLOR_ERROR='\033[1;31m'      # 红色
readonly COLOR_WARNING='\033[1;33m'    # 黄色
readonly COLOR_SUCCESS='\033[1;32m'    # 绿色
readonly COLOR_INFO='\033[1;36m'       # 青色

# 打印带颜色的消息
print_header() {
    local msg="$1"
    local color="$2"
    echo -e "${color}${msg}${COLOR_RESET}"
}

# 检查服务状态
check_services() {
    echo ""
    print_header "╔════════════════════════════════════════════════════════════╗" "$COLOR_INFO"
    print_header "║         YangHoo AI - 实时监控模式                         ║" "$COLOR_INFO"
    print_header "╚════════════════════════════════════════════════════════════╝" "$COLOR_INFO"
    echo ""

    # 检查后端
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_header "✓ 后端运行中: http://localhost:8000" "$COLOR_BACKEND"
    else
        print_header "✗ 后端未运行" "$COLOR_ERROR"
        echo ""
        read -p "是否启动后端? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            (cd "${PROJECT_ROOT}/backend" && nohup uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > "${PROJECT_ROOT}/backend.log" 2>&1 &)
            sleep 3
        fi
    fi

    # 检查前端
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_header "✓ 前端运行中: http://localhost:3000" "$COLOR_FRONTEND"
    else
        print_header "✗ 前端未运行" "$COLOR_ERROR"
        echo ""
        read -p "是否启动前端? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ ! -d "${PROJECT_ROOT}/frontend/node_modules" ]; then
                (cd "${PROJECT_ROOT}/frontend" && npm install)
            fi
            (cd "${PROJECT_ROOT}/frontend" && nohup npm start > "${PROJECT_ROOT}/frontend.log" 2>&1 &)
            sleep 3
        fi
    fi

    echo ""
}

# 监控函数
monitor_logs() {
    # 使用 trap 确保退出时恢复终端
    trap 'echo -e "${COLOR_RESET}"; echo "监控已停止"; exit' INT TERM

    print_header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "$COLOR_INFO"
    print_header "  实时监控模式已启动" "$COLOR_INFO"
    print_header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "$COLOR_INFO"
    echo ""
    echo "快捷键:"
    echo "  Ctrl+C - 退出监控"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # 使用 multitail 如果可用，否则使用 tail -f
    if command -v multitail &> /dev/null; then
        # multitail: 更强大的分屏监控
        multitail \
            -s 2 \
            -l "tail -f ${PROJECT_ROOT}/backend.log" \
            -l "tail -f ${PROJECT_ROOT}/frontend.log"
    else
        # 回退方案：使用 tail -f
        (
            # 后端监控（蓝色）
            tail -f "${PROJECT_ROOT}/backend.log" 2>/dev/null | while IFS= read -r line; do
                if [[ "$line" =~ ERROR|Exception|Traceback ]]; then
                    echo -e "${COLOR_ERROR}[后端]${COLOR_RESET} ${COLOR_ERROR}$line${COLOR_RESET}"
                elif [[ "$line" =~ WARNING|WARN ]]; then
                    echo -e "${COLOR_WARNING}[后端]${COLOR_RESET} ${COLOR_WARNING}$line${COLOR_RESET}"
                elif [[ "$line" =~ INFO|GET|POST|PUT|DELETE ]]; then
                    echo -e "${COLOR_BACKEND}[后端]${COLOR_RESET} $line"
                else
                    echo -e "${COLOR_BACKEND}[后端]${COLOR_RESET} $line"
                fi
            done
        ) &

        (
            # 前端监控（绿色）
            tail -f "${PROJECT_ROOT}/frontend.log" 2>/dev/null | while IFS= read -r line; do
                if [[ "$line" =~ ERROR|Failed|Error ]]; then
                    echo -e "${COLOR_ERROR}[前端]${COLOR_RESET} ${COLOR_ERROR}$line${COLOR_RESET}"
                elif [[ "$line" =~ WARN|Warning ]]; then
                    echo -e "${COLOR_WARNING}[前端]${COLOR_RESET} ${COLOR_WARNING}$line${COLOR_RESET}"
                elif [[ "$line" =~ Compiled|webpack:|Local: ]]; then
                    echo -e "${COLOR_SUCCESS}[前端]${COLOR_RESET} $line"
                else
                    echo -e "${COLOR_FRONTEND}[前端]${COLOR_RESET} $line"
                fi
            done
        ) &

        # 等待所有后台进程
        wait
    fi
}

# 主函数
main() {
    # 检查服务状态
    check_services

    # 启动监控
    monitor_logs
}

# 运行
main
