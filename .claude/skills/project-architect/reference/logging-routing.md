# 前后端日志与自动寻址（Logging & Routing Index）

## 目录结构
- 统一根目录：`.agent/logs/`
- 前端：`.agent/logs/frontend/<app>/`（info/error 分离）
- 后端：`.agent/logs/backend/<service>/`（info/error 分离）
- 公共/系统：`.agent/logs/common/`、`.agent/logs/diagnose/`

## 路由登记
- 存储：`.agent/manifests/log-routing.json`（只读，CI 生成）
- 最小字段：`component`、`identifier`、`route`、`log_files{info,error}`、`created_at`
- 版本控制与索引更新：随代码版本化；部署阶段自动生成

## 自动寻址
- 查询优先级：精确→模糊→目录约定回退
- 读取策略：默认 tail -n 500；支持关键字与时间范围
- 输出格式：JSON Lines 或 Plain

## 脚本与 CLI 规范
- 入口：`log-cli [--log-dir] [--component] [--identifier] [--route] [--date] [--keyword] [--format]`
- 默认 `--log-dir=.agent/logs`，拒绝绝对路径与 `../`
- 参数校验：`realpath --canonicalize-missing`

## 安全与合规
- 敏感字段脱敏与最小化原则
- 权限：目录 0755，文件 0644；错误日志可追加防篡改
- 定期审计与告警阈值（5min ≥10 ERROR）

## 验收闭环
- 机器自检：结构、格式、脱敏样例
- 人工验收：路由注册、dry-run 验证、抽样脱敏检查
