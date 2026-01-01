# Git Worktree (GitHub-oriented)

## When to use
- Parallel development on multiple branches without extra clones
- Large PR isolation and review sandbox
- Quickly spin up ephemeral environments for testing

## Create a worktree
- Existing branch:
  - `git fetch origin`
  - `git worktree add ../w-feature feature-name`
- New branch from main:
  - `git fetch origin`
  - `git worktree add ../w-feature -b feature-name origin/main`
- List:
  - `git worktree list`

## Push and track
- Inside worktree:
  - `git status`
  - `git commit -m "feat: ..."`
  - `git push -u origin feature-name`

## Rebase against main
- `git -C ../w-feature fetch origin`
- `git -C ../w-feature rebase origin/main`
- Prefer `--rebase` on pull: `git -C ../w-feature pull --rebase`

## Review a GitHub PR via worktree
- Fetch PR:
  - `git fetch origin pull/<ID>/head:pr-<ID>`
- Create:
  - `git worktree add ../w-pr-<ID> pr-<ID>`

## Remove and prune
- Remove:
  - `git worktree remove ../w-feature`
- Prune stale entries:
  - `git worktree prune`

## Safety and best practices
- Name worktree dirs `../w-<branch>` outside repo root
- Avoid `--force` on shared branches; use `--force-with-lease` if truly needed
- Ensure no untracked files before remove; confirm correct worktree path
- Run local checks inside worktree:
  - `bash .claude/skills/project-architect/scripts/verify_gate.sh`

## Why worktree over extra clones
- Shares `.git` objects; faster and disk-efficient
- Keeps configurations centralized while isolating working directories
