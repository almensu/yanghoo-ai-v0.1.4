#!/bin/bash
echo "📦 Installing Husky and Commitlint..."
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
npx husky init
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
echo "npx --no -- commitlint --edit $1" > .husky/commit-msg
echo "✅ Git hooks setup complete. Commits will now be strictly validated."
