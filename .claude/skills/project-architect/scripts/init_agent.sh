#!/bin/bash
# init_agent.sh

echo "🏗️  Initializing Project Architect Structure..."

mkdir -p .agent/{planning,specs,memory,scripts,outputs,manifests,logs,tmp,tests}
mkdir -p .agent/tests/{temp,regression}
mkdir -p .agent/outputs/{docs,pptx,xlsx,docx,pdf,text,images,subtitles}
mkdir -p .agent/logs/{frontend,backend,common,diagnose,alerts}

# 2. 初始化记忆文件
if [ ! -f .agent/memory/active_context.md ]; then
    echo "Status: Idle" > .agent/memory/active_context.md
fi

if [ ! -f .agent/memory/changelog.md ]; then
    echo "# Changelog" > .agent/memory/changelog.md
fi

echo "✅ .agent directory structure created."
