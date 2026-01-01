# Verification playbook

目标是把每个任务变成可验证闭环。

## Rules
- 每个任务必须写 Verification
- 优先自动验证，其次人工验证
- Evidence 必须可复现，别人按 Evidence 的命令能得到相同结论

## Recommended verification ladder
按优先级从上到下选，能选高就不要选低
1 单元测试  
2 集成测试  
3 类型检查  
4 lint  
5 build  
6 本地运行 smoke test  
7 人工验证步骤

## Common commands examples
你应按项目实际替换命令

Node
- npm test
- npm run test
- npm run lint
- npm run typecheck
- npm run build

Python
- pytest
- ruff check .
- mypy .
- python -m compileall .

Go
- go test ./...
- golangci-lint run
- go build ./...

Rust
- cargo test
- cargo clippy
- cargo build

## Evidence writing standard
Evidence 要写清三件事
- 运行了什么命令
- 关键输出是什么
- 结果怎么判定

推荐格式
- Command: <command>
- Output: <copy key lines or summary>
- Result: pass or fail

## Manual verification standard
当必须人工验证时，你必须停下并要求用户执行。
你要提供
- 操作路径
- 预期结果
- 失败时如何回滚或如何抓日志

例
- 打开页面 A
- 点击按钮 B
- 预期看到 toast 成功
- Network 中请求返回 200
- Console 无 error
