import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export function resolveApiProjectRoot(): string {
  if (process.env.YANGHOO_REPO_ROOT) {
    return path.resolve(process.env.YANGHOO_REPO_ROOT);
  }

  const currentFilePath = fileURLToPath(import.meta.url);
  const candidates = [
    path.dirname(currentFilePath),
    process.cwd()
  ];

  for (const candidate of candidates) {
    const root = findWorkspaceRoot(candidate);
    if (root) return root;
  }

  return process.cwd();
}

function findWorkspaceRoot(startDir: string): string | null {
  let current = path.resolve(startDir);
  while (current !== path.parse(current).root) {
    const packageJsonPath = path.join(current, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.workspaces) return current;
      } catch {
        // Keep walking if package.json cannot be parsed.
      }
    }
    current = path.dirname(current);
  }

  return null;
}
