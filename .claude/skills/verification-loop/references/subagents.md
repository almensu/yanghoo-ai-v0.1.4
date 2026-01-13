# Subagent playbook (recommended)

Subagents are invoked via the Task tool. The main agent can invoke them automatically based on description, or explicitly by name ("Use the X agent to..."). Do NOT give subagents the Task tool.

## Recommended roles
1) verify-work: runs verify.sh + summarizes evidence (Bash/Read/Grep/Glob)
2) verify-fix: reads evidence + applies minimal patch (Read/Edit/Write/Grep/Glob)
3) verify-ui: runs Playwright smoke/e2e (Bash/Read/Grep/Glob)

## Explicit invocation examples
- "Use the verify-work agent to run verification and report evidence."
- "Use the verify-fix agent to patch the failing test, then re-run verification."
