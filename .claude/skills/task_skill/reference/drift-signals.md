# Drift signals

出现以下任意信号，立即停止，回到 tasks.md 与 design.md。

## Scope drift
- 修改了 Files to touch 之外的文件
- 做了任务未要求的重构
- 顺便改了无关逻辑或无关样式
- 一次提交里混入多个任务内容

## Spec drift
- requirements.md 与 design.md 没提到的行为被加入
- API 契约被擅自改变
- 错误处理策略与 design.md 不一致
- 引入新依赖或新服务，但 spec 中没有

## Verification drift
- 没有跑验证就说通过
- 验证失败还推进下一步
- 手工验证没有停下要求用户确认
- Evidence 空着或写得含糊

## Maintainability drift
- 引入复杂抽象但没有收益
- 代码难读且无注释无测试
- 同一逻辑复制粘贴多处
- 关键边界条件未覆盖

## What to do when drift happens
1 停止继续写代码  
2 在 tasks.md 里记录发现的 drift  
3 若属于设计问题，先更新 design.md  
4 若属于任务拆分问题，先把 tasks 拆细  
5 然后再回到执行模式，一次只做一个 checkbox
