# Level 3: Docker Compose + Traefik（Zero Port Exposure）

## docker-compose.yml 片段（示例）
```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

  api:
    image: your-api:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.localhost`)"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
    # 不写 ports: 到宿主机

  app:
    image: your-frontend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.localhost`)"
      - "traefik.http.services.app.loadbalancer.server.port=3000"
    # 不写 ports: 到宿主机
```

## 要点
- 仅 Traefik 暴露 80/443，业务服务通过 labels 路由，不与宿主机端口直接绑定
- 添加新服务复制配置块并修改 Host 与内部端口，无需考虑端口占用
