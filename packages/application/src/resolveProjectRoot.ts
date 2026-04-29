import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Resolves the project repository root directory.
 * 
 * Strategy:
 * 1. Check for YANGHOO_REPO_ROOT environment variable.
 * 2. Use import.meta.url to find the package directory and walk up.
 * 3. Fallback to walking up from process.cwd().
 */
export function resolveProjectRoot(): string {
  // 1. Environment variable override
  if (process.env.YANGHOO_REPO_ROOT) {
    return path.resolve(process.env.YANGHOO_REPO_ROOT);
  }

  // 2. Resolve via import.meta.url
  // This file is at: packages/application/src/resolveProjectRoot.ts
  // In dist it is at: packages/application/dist/resolveProjectRoot.js
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    let current = __dirname;
    while (current !== path.parse(current).root) {
      if (fs.existsSync(path.join(current, 'package.json')) && 
          fs.existsSync(path.join(current, 'scripts'))) {
        // Double check it's the root package.json by looking for workspaces
        const pkg = JSON.parse(fs.readFileSync(path.join(current, 'package.json'), 'utf-8'));
        if (pkg.workspaces) {
          return current;
        }
      }
      current = path.dirname(current);
    }
  } catch (e) {
    // Fallback if ESM resolution fails
  }

  // 3. Fallback: walk up from process.cwd()
  let current = process.cwd();
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'package.json')) && 
        fs.existsSync(path.join(current, 'scripts/transcript/run-mlx-audio-transcription.py'))) {
      return current;
    }
    current = path.dirname(current);
  }

  // Last resort: assume process.cwd() but it might be wrong (which will be caught by existsSync check later)
  return process.cwd();
}

/**
 * Resolves a script path relative to the project root and verifies its existence.
 */
export function resolveRootScript(relativeScriptPath: string): string {
  const root = resolveProjectRoot();
  const scriptPath = path.resolve(root, relativeScriptPath);
  
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`
Required script not found.
Expected Path: ${scriptPath}
Current CWD: ${process.cwd()}
Resolved Root: ${root}
Relative Path: ${relativeScriptPath}

Please ensure you are running the application from a complete checkout and that the script exists at the expected location.
    `.trim());
  }
  
  return scriptPath;
}
