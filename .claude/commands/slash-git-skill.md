---
description: Launch git-skill for Git commit conventions, workflow and security best practices
model: sonnet
allowed-tools: Skill, Read, AskUserQuestion
argument-hint: [topic]
---

# Git Skill

Invoke the git-skill to enforce conventional commits, atomic workflow and security configurations.

## Usage

Use this command when you need to:
- Write conventional commit messages (50/72 rule)
- Keep atomic commits and linear history (rebase, fixup, autosquash)
- Configure security (gitignore, prevent secrets, signed commits)
- Initialize hooks (Husky + Commitlint)

## Examples

- `/slash-git-skill` - Launch with interactive guidance
- `/slash-git-skill "commit message"` - Draft a conventional commit message
- `/slash-git-skill workflow` - Get atomic commit & linear history guidance
- `/slash-git-skill security` - Configure ignore rules and signed commits
- `/slash-git-skill hooks` - Initialize Husky + Commitlint setup

## References
- Commit standards: `reference/conventions.md`
- Workflow: `reference/workflow.md`
- Security: `reference/security.md`
- Hooks: `script/init-hooks.sh`

Skill: git-skill
