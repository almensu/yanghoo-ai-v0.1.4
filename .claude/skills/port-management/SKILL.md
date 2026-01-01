---
name: port-management
description: Guides port and service management across low/medium/high complexity architectures; use when choosing startup orchestration, reverse proxies, and port strategies for local development and monorepos.
---

# Port Management

## 触发信号
- 启动/端口冲突/反向代理/HTTPS/Monorepo/Compose/Traefik/Caddy/Turborepo/Nx
- 需要选择本地服务编排方式与端口策略

## 分级最佳实践
- Level 1（低复杂度，2–3 服务）
  - 并发编排：concurrently 或 npm-run-all
  - 同步依赖：wait-on，确保后端启动后再启动前端
  - 端口策略：静态分配（示例：前端 3000，后端 8080）；开发态开启宽松 CORS（仅在 `NODE_ENV=development`）
  - 详见 `reference/level-1-concurrently.md`
- Level 2（中复杂度，Monorepo 3–5 服务）
  - 编排：Turborepo 或 Nx（缓存、并行、任务图）
  - 代理：Caddy；维护根级 Caddyfile
  - 域名路由：`app.localhost → localhost:3000`，`api.localhost → localhost:8000`
  - 获得 HTTPS 与统一入口，保留原生开发体验
  - 详见 `reference/level-2-orchestrators.md` 与 `reference/level-2-caddy.md`
- Level 3（高复杂度，5+ 服务，多语言微服务）
  - 编排：Docker Compose
  - 代理：Traefik
  - 端口策略：Zero Port Exposure；除 Traefik 暴露 80/443/8080 外，业务容器不映射宿主机端口
  - 路由：通过 Docker labels 定义规则（如 `Host('api.localhost')`）
  - 详见 `reference/level-3-compose-traefik.md`

## 选择工作流（速查）
- 服务数量 ≤3 且无需 HTTPS → 选 Level 1
- Monorepo（Turborepo/Nx）且需统一域名/HTTPS → 选 Level 2
- 多语言微服务、消息队列、数据库等复杂依赖 → 选 Level 3
- 详见 `reference/decision-matrix.md`

## 执行顺序（最佳实践）
- 选择层级 → 启动（Start）→ 等待端口与健康检查 → 运行测试（Testing Code Skill）→ 停止（Stop）→ Stop Hook 自动测试与验收
- 测试治理参考 `/.claude/skills/testing-code/SKILL.md` 与其 `reference/*`

## 与项目约束对齐
- 资产与日志：仅写入 `.agent/` 前缀目录（`outputs/`、`manifests/`、`logs/`）
- 路径安全：拒绝路径穿越；禁止写入根与 `src/`
- 验收闭环：结合 `project-architect` 的 `verify_gate.sh` 与 Stop Hook 测试

## 与 Start/Stop Hooks 联动
- Level 1：结合 `.claude/hooks/start.sh` 与 `.claude/hooks/stop.sh` 优雅清理端口 3000/5173，顺序启动
- Level 2/3：优先使用代理/编排工具的启动命令；测试阶段按 Stop Hook 路径执行验收

## 参考
- `reference/level-1-concurrently.md`
- `reference/level-2-orchestrators.md`
- `reference/level-2-caddy.md`
- `reference/level-3-compose-traefik.md`
- `reference/decision-matrix.md`
- `/.claude/skills/testing-code/SKILL.md`

## 脚本
- 启动：`/.claude/skills/port-management/scripts/start.sh`
- 停止：`/.claude/skills/port-management/scripts/stop.sh`
- 用法示例
  - Level 1 开发：`bash .claude/skills/port-management/scripts/start.sh --level 1 --mode dev --backend-port 3000 --frontend-port 5173 --frontend-dir src/frontend`
  - Level 1 停止：`bash .claude/skills/port-management/scripts/stop.sh --level 1 --backend-port 3000 --frontend-port 5173`
  - Level 3 编排：`bash .claude/skills/port-management/scripts/start.sh --level 3`
