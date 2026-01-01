# Git Security Best Practices

## 1. Secret Prevention
-   [cite_start]**Global Ignore:** Use `~/.gitignore_global` for OS files (.DS_Store) and IDE configs (.vscode/) [cite: 119-121].
-   [cite_start]**Project Ignore:** Commit `.gitignore` for build artifacts (/dist/, /node_modules/)[cite: 123].
-   [cite_start]**Pre-commit Hooks:** Use tools like `gitleaks` to block commits containing secrets[cite: 133].

## 2. Signed Commits (SSH)
[cite_start]Verify identity to prevent impersonation[cite: 143]. [cite_start]Recommended to use SSH keys as it is simpler than GPG[cite: 149].

**Configuration:**
```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

