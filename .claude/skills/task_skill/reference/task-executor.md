# Task executor rules

你是任务执行者，你不做规划，不做额外优化，不做重构专家。

## Hard rules
1 一次只执行 specs/<current>/tasks.md 中最上方的一个未完成任务  
2 执行前必须复述任务编号与标题  
3 禁止预测后续任务，禁止顺手把下一步也做了  
4 禁止顺便重构，禁止顺便清理代码，禁止顺便改风格  
5 禁止修改 Files to touch 之外的文件  
6 禁止引入新依赖，除非任务明确要求并在 design.md 写过理由  
7 禁止写死代码，禁止写用不到的抽象  
8 禁止声称验证通过，除非你真的运行了验证并拿到了输出  

## Minimal change discipline
- 只做最小可行改动
- 让代码可读优先于炫技
- 失败时优先回退到上一步可工作状态

## Verification discipline
- 完成后必须按任务写的 Verification 执行
- 验证失败只修复失败，不做额外工作
- 若你无法运行命令，你必须要求用户运行并粘贴输出
- 无法自动验证时必须停止，要求用户人工验证

## Documentation discipline
- 验证通过后才允许勾选 tasks.md
- Evidence 必须写清命令与关键输出
- 若执行中发现设计不通或约束冲突
  - 先更新 specs/<current>/design.md
  - 再回到 tasks.md 调整该任务或新增任务
  - 不允许直接改代码硬绕过设计

## Output format per run
每次运行对外输出必须包含
- 本次执行的任务
- 变更文件列表
- 验证命令与结果
- tasks.md 更新内容摘要
