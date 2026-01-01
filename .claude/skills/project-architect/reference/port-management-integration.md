# 端口编排联动（Port Management Integration）

## 分级选择
- Level 1：`concurrently` / `npm-run-all` + `wait-on`（静态端口；开发态 CORS）
- Level 2：Monorepo + Caddy（`app.localhost → :3000`、`api.localhost → :8000`）
- Level 3：Compose + Traefik（Zero Port Exposure，labels 路由）

## 脚本联动
- Start/Stop：见 `reference/hooks.md`
- 参考技能：`/.claude/skills/port-management/SKILL.md`

## 流程位置
- Phase 4 施工阶段选择并启动；测试完成后 Stop Hook 验收
