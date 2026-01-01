---
name: project-architect
description: 项目首席架构师。强制执行“规范驱动开发”。负责项目初始化、P-序列版本规划(MVP/Task)、以及强制性的 MVP 验收闭环。严禁直接修改业务代码，必须先由文档定义。
---

# Project Architect - 施工总指挥与质检官

## 概览与铁律
- 物理隔离：思考、规划、记忆在 `.agent/`；`src/` 仅存放纯净代码
- 无图纸不施工：没有 MVP 定义与 Task 路径，不写业务代码
- 验收闭环：以 `verify_gate.sh` 通过且人工批准为准
- 详见 `reference/governance.md`

## 工具箱
- 见 `reference/toolbox.md`

## 标准作业程序（SOP）

### Phase 1: 初始化
- 建立 `.agent` 目录；生成 `.agent/governance.md`；创建 `.agent/specs/index.md`
- 详见 `reference/governance.md`

### Phase 2: 规划与定界
- 基于索引识别下一版；在 `.agent/specs/<nn_mvp>/` 生成 `prd.md` 并明确范围；等待批准
- 详见 `reference/mvp.md`

### Phase 3: 路径拆解
- 在 `.agent/specs/<nn_mvp>/` 生成 `tasks.md`、`requirements.md`、`design.md`；更新 `active_context.md`
- 详见 `reference/task.md`

### Phase 4: 施工与循环
- 执行任务、运行测试、更新勾选；启动/停止脚本与测试闭环见 `reference/hooks.md`

### Phase 5: 最终验收
- 运行 `verify_gate.sh` 自检；人工验收通过后收尾
- 详见 `reference/verification-gate.md`

## Hooks
- 见 `reference/hooks.md`

## 资产存储约束
- 见 `reference/asset-storage-constraints.md`
## 参考
- `reference/governance.md`
- `reference/mvp.md`
- `reference/task.md`
- `reference/toolbox.md`
- `reference/hooks.md`
- `reference/verification-gate.md`
- `reference/asset-storage-constraints.md`
- `reference/logging-routing.md`
- `reference/temp-tests-governance.md`
- `reference/sop.md`
- `reference/specs-index.md`
- `reference/change-control.md`
- `reference/port-management-integration.md`
- `reference/security-compliance.md`
- `reference/adr-guidelines.md`
- `reference/rollback-and-regression.md`

## CLAUDE.md 指南（给 AI 的项目说明书）
- 详见 `reference/claude-guide.md`

## 日志与自动寻址
- 见 `reference/logging-routing.md`

### 1. 目录与文件结构（最佳实践）
- 统一根目录：`.agent/logs/`
- 前端：
  - 应用隔离：`.agent/logs/frontend/<app>/`
  - 日志级别分离：
    - 普通日志：`<app>-<YYYY-MM-DD>.log`
    - 错误日志：`<app>-<YYYY-MM-DD>.error.log`
- 后端：
  - 服务隔离：`.agent/logs/backend/<service>/`
  - 日志级别分离：
    - 普通日志：`<service>-<YYYY-MM-DD>.log`
    - 错误日志：`<service>-<YYYY-MM-DD>.error.log`
- 公共/系统：
  - 公共日志：`.agent/logs/common/agent-<YYYY-MM-DD>.log`
  - 脚本级诊断：`.agent/logs/diagnose/verify-<YYYY-MM-DD>.log`

### 2. 日志轮转与命名（最佳实践）
- 每日轮转（UTC+08:00 00:00触发）。
- 文件名格式：`组件-标识-日期[-级别][-partN].log`，避免路径重复。
- 大小切分：单文件 ≥100 MB 时自动追加 `-partN`，N 从 1 递增。
- 压缩归档：`.log` 轮转后延迟 24h 压缩为 `.log.gz`，保留 30 天。
- 符号链接：最新活跃日志始终链接至 `current.log` 便于 tail。

### 3. 路由登记（索引表）
- 存储：`.agent/manifests/log-routing.json`（只读，CI 生成）。
- 最小字段：
  ```
  {
    "routes": [
      {
        "component": "frontend|backend|common",
        "identifier": "<app>|<service>",
        "route": "<path|method+path>",
        "log_files": {
          "info": "相对路径，不含前缀",
          "error": "相对路径，不含前缀"
        },
        "created_at": "ISO-8601"
      }
    ]
  }
  ```
- 版本控制：路由表随代码版本化，变更需 PR 评审。
- 索引更新：由 `log-route-indexer` 在部署阶段自动生成，禁止手工编辑。

### 4. 自动寻址行为
- 查询优先级：
  1. 精确匹配 `log-routing.json`。
  2. 模糊匹配：`*` 通配符支持。
  3. 目录约定回退：按 `component/identifier/date` 拼装。
- 读取策略：
  - 默认 tail -n 500。
  - 支持 `--keyword=ERROR|WARN|requestId` 过滤。
  - 支持 `--start-time/--end-time` 时间范围。
- 输出格式：JSON Lines 或 Plain，默认 JSON Lines 便于下游解析。

### 5. 脚本与 CLI 规范（最佳实践）
- 统一入口：`log-cli [--log-dir] [--component] [--identifier] [--route] [--date] [--keyword] [--format]`
- 默认 `--log-dir=.agent/logs`，拒绝绝对路径与 `../`。
- 参数校验使用 `realpath --canonicalize-missing` 确保路径前缀安全。
- 输出到终端时带颜色区分级别；输出到文件时默认无颜色。

### 6. 安全与合规
- 敏感字段脱敏：身份证号、手机号、邮箱、Token、密钥统一掩码为 `***`。
- 个人数据遵循最小化原则，禁止完整记录请求体/响应体，仅记录哈希或 ID。
- 文件权限：`.agent/logs/` 0755，日志文件 0644，错误日志额外加 `chattr +a` 防篡改。
- 定期审计：每周运行 `log-audit.sh` 检查异常关键字与权限漂移。

### 7. 监控与告警
- 关键错误（ERROR/FATAL）实时推送至 `.agent/logs/alerts/<date>.json`。
- 告警阈值：单服务 5min 内 ≥10 条 ERROR 即触发告警。
- 集成：通过 `alertmanager-webhook` 发送飞书/Slack，路由表内配置接收人。

### 8. 验收闭环
- 机器自检（CI 阶段）：
  - 目录存在性与权限校验。
  - `log-routing.json` 格式与路由唯一性校验。
  - 敏感信息样例扫描（正则+字典）。
- 人工验收（发布前）：
  - 新增路由是否在表中注册。
  - 使用 `log-cli --dry-run` 验证寻址结果。
  - 确认脱敏规则生效：抽样 10 条日志无敏感明文。
- 验收通过标准：
  - 机器自检 0 错误。
  - 人工验收结论“通过”并签字（Comments 留痕）。

## 临时测试脚本治理
- 见 `reference/temp-tests-governance.md`
- 目标：在遇到错误时，用最小、可复现、可验证的临时测试脚本定位并修复问题；修复后转为回归测试或清理。
- 目录分层：
  - 临时测试：`.agent/tests/temp/`
  - 回归测试：`.agent/tests/regression/`
- 命名规范：
  - `YYYYMMDD-HHMM-<component>-<scope>-<short-desc>.test.sh`
  - 示例：`20251223-1540-backend-api-videos-id-err500.test.sh`
  - 同分钟多例使用后缀：`-seq2`
- 元数据清单：
  - 存放：`.agent/manifests/tests-index.json`
  - 字段建议：`created_at`、`component`、`scope`、`entry`、`expected`、`status(temp|regression|archived)`、`related_issue_id`
- 执行策略：
  - 临时测试默认手动执行；输出日志写入 `.agent/logs/diagnose/`
  - 回归测试纳入 CI；与 `verify_gate.sh` 分离，避免无配置项目误失败
  - 统一参数：支持 `--out-dir`、`--date`、`--format=json|plain`
- 保留与归档：
  - 临时测试保留 30 天；问题修复后迁移到回归目录或归档删除
  - 更新 `tests-index.json` 中对应条目状态
- 安全与合规：
  - 拒绝路径穿越（`../`）；不得写根与 `src/`
  - 统一脱敏：日志中掩码敏感信息（邮箱、手机号、Token）
- 验收闭环：
  - 临时测试：复现→修复→验证通过→转回归/归档
  - 人工验收：记录结论与关联问题编号（Comments 留痕）
