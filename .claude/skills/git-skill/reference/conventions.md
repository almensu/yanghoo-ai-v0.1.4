# Git Commit Conventions & Standards

## 1. The 50/72 Rule
[cite_start]Strict formatting ensures readability in CLI tools and logs[cite: 36].
-   **Subject Line:** Max 50 chars. Capitalized. No trailing period. [cite_start]Use **Imperative Mood** (e.g., "Add feature" not "Added feature") [cite: 40-44].
-   **Body:** Wrap at 72 chars. Separate from subject with a blank line. [cite_start]Focus on **WHAT** and **WHY**, not HOW [cite: 45-49].

## 2. Conventional Commits (Semantic Types)
[cite_start]Follow the schema: `<type>[optional scope]: <description>`[cite: 53].

| Type | Description | SemVer Impact |
| :--- | :--- | :--- |
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | Patch |
| `style` | Formatting (whitespace, semi-colons) | Patch |
| `refactor` | Code change that neither fixes a bug nor adds a feature | Patch |
| `perf` | Performance improvement | Patch |
| `test` | Adding/missing tests | Patch |
| `build` | Build system/dependencies | Patch |
| `ci` | CI configuration | Patch |
| `chore` | Maintainance/Auxiliary tools | Patch |
| `revert` | Reverting a commit | Patch |

[cite_start][cite: 56]

## 3. Breaking Changes
-   [cite_start]**Footer:** Start with `BREAKING CHANGE:` followed by a description[cite: 60].
-   [cite_start]**Header:** Add `!` after type/scope (e.g., `feat!: drop support for Node 12`)[cite: 61].

