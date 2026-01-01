# Advanced Git Workflow & History Management

## 1. Atomic Commits
[cite_start]A commit must solve ONE problem (Single Responsibility)[cite: 9].
-   [cite_start]**Completeness:** Code must compile and pass tests at every commit[cite: 10].
-   [cite_start]**Tools:** Use `git add -p` (Interactive Staging) to split changes logically if you edited multiple areas in one go [cite: 20-21].

## 2. Linear History Strategy
-   **Rebase vs. Merge:** Prefer `git rebase` for local branches to maintain a linear structure. [cite_start]History should be a narrative, not a record of chaos[cite: 70].
-   [cite_start]**Golden Rule:** Never rebase public/shared branches (like `main`)[cite: 75].
-   **Workflow:**
    1.  Develop on feature branch.
    2.  Frequently `git rebase main`.
    3.  [cite_start]Squash WIP commits before merging[cite: 31].

## 3. Fixup & Autosquash
[cite_start]Use this workflow to fix previous commits without creating "fix typo" pollution[cite: 93].
1.  [cite_start]**Create Fixup:** `git commit --fixup <Hash-of-Bad-Commit>`[cite: 99].
2.  [cite_start]**Apply Fixup:** `git rebase -i --autosquash main`[cite: 103].

