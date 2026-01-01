# Hooks（Start/Stop 与 Stop Hook 自动测试）

## Start/Stop Hooks
- 启动：`bash .claude/hooks/start.sh [--mode dev|prod]`
- 停止：`bash .claude/hooks/stop.sh`
- 行为：
  - 启动前优雅停止端口占用（默认 3000/5173）
  - 记录 PID 至 `.agent/tmp/pids/`，日志写 `.agent/logs/{backend,frontend}/`
  - 停止时读取 PID 或按端口停止，日志写 `.agent/logs/diagnose/stop-<YYYY-MM-DD>.log`
  - 追加停止清单到 `.agent/manifests/stop-run.json`

## Stop Hook 自动运行测试
- 目的：在任务停止或阶段收尾时自动触发测试，保障验收闭环的一致性
- 路径建议：`.claude/hooks/stop-hook.sh`
- 执行逻辑：
  - 若 `package.json` 存在且包含 `test` 脚本：执行 `npm test`
  - 否则：执行 `bash .claude/skills/project-architect/scripts/verify_gate.sh`
- 日志与资产：
  - 日志写入 `.agent/logs/diagnose/stop-<YYYY-MM-DD>.log`
  - 产物写入 `.agent/outputs/text/`，并登记 `.agent/manifests/`
- 安全与约束：拒绝路径穿越；禁止写入项目根与 `src/`
- 集成点：在 Phase 4 施工循环的收尾与 Phase 5 验收前触发
