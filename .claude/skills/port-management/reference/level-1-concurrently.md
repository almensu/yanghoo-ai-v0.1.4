# Level 1: concurrently + npm-run-all + wait-on

## 目标
- 管理 2–3 个服务的本地启动，避免端口冲突与竞态

## 推荐命令
- 并发启动（示例）
```bash
npx concurrently "npm:dev:backend" "wait-on tcp:3000 && npm:dev:frontend"
```
- 或使用 npm-run-all 管道
```bash
npx npm-run-all -p dev:backend dev:frontend
```

## 端口与 CORS
- 端口：静态分配（示例：前端 3000，后端 8080）
- CORS：仅在 `NODE_ENV=development` 开启宽松策略
