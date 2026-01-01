#!/bin/bash
# init_agent.sh

echo "🏗️  Initializing Project Architect Structure..."

# 1. 创建目录树
mkdir -p .agent/{planning,specs,memory,scripts}

# 2. 初始化记忆文件
if [ ! -f .agent/memory/active_context.md ]; then
    echo "Status: Idle" > .agent/memory/active_context.md
fi

if [ ! -f .agent/memory/changelog.md ]; then
    echo "# Changelog" > .agent/memory/changelog.md
fi

echo "✅ .agent directory structure created."