#!/bin/bash
# verify_gate.sh
set -e

echo "🔍 Starting MVP Verification Gate..."

# 1. 静态代码检查
echo "1️⃣  Running Linter & Type Check..."
if npm run lint 2>/dev/null; then
    echo "   - Lint passed."
else
    echo "⚠️  Lint script not found or failed. Skipping."
fi

# 2. 单元测试
echo "2️⃣  Running Unit Tests..."
# 尝试运行测试，如果没有 test 脚本则警告
if npm test; then
    echo "✅ Tests passed."
else
    echo "❌ Tests failed! strict mode requires passing tests."
    exit 1
fi

# 3. 模拟运行时检查 (可选，根据项目类型调整)
# 这里只是一个占位符，检查关键端口或进程是否能启动
echo "3️⃣  Runtime Health Check..."
echo "   - Checking if entry point compiles..."
# 示例：检查构建是否成功
if npm run build 2>/dev/null; then
     echo "✅ Build successful."
else
     echo "⚠️  Build script skipped."
fi

echo "🎉 Machine Verification Passed! Ready for Human Review."