# Level 2: Caddy 反向代理（Monorepo）

## Caddyfile 示例
```caddy
app.localhost {
    reverse_proxy localhost:3000
}

api.localhost {
    reverse_proxy localhost:8000
}
```

## 说明
- 在根目录维护 Caddyfile，提供本地 HTTPS 与统一域名入口
- 适合前端团队保留原生开发体验的场景
