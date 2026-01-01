# Port Management 决策矩阵

## 维度
- 服务数量：2–3 / 3–5 / 5+
- 团队规模：个人 / 小团队 / 多团队
- 需求：统一域名 / 本地 HTTPS / 多语言微服务 / 消息队列/数据库

## 建议
- Level 1（≤3 服务，低复杂度）
  - concurrently / npm-run-all + wait-on
  - 静态端口分配；开发态 CORS
- Level 2（3–5 服务，Monorepo）
  - Turborepo/Nx 编排
  - Caddy 反向代理（app.localhost、api.localhost）
- Level 3（5+ 服务，高复杂度）
  - Docker Compose + Traefik
  - Zero Port Exposure；labels 路由

## 迁移路径
- L1 → L2：引入 Monorepo 编排与 Caddy，保留原生开发体验
- L2 → L3：引入 Compose 与 Traefik；统一到域名路由，彻底消除端口冲突
