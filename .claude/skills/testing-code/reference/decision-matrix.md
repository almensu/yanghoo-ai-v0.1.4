# 测试层级决策矩阵

## 输入维度
- 变更类型：UI 组件/样式、接口契约/路由、数据模型/逻辑、基础设施/脚本
- 风险等级：低/中/高
- 依赖影响：单模块/跨模块/跨服务

## 映射建议
- UI 改动：E2E（页面流程）+ 少量 Unit（逻辑）\n- 接口改动：Integration（接口链路）+ Unit（服务端逻辑）\n- 纯算法与工具：Unit（覆盖分支）\n- 脚本与基础设施：Integration（脚本行为）+ 闸门验证

## 执行顺序
- Unit（快）→ Integration（稳）→ E2E（验收）\n- 每层级产物写 `.agent/outputs/tests/`，清单追加至 `test-run.json`
