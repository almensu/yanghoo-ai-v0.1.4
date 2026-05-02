import type { CliContext } from './cli-runtime-config.js';

export function presentCliError(error: unknown, context: CliContext): void {
  const message = error instanceof Error ? error.message : String(error);
  if (context.json) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: message }, null, 2)}\n`);
    return;
  }

  process.stderr.write(`Error: ${message}\n`);
}

export async function withJsonSafeLogs<T>(context: CliContext, fn: () => Promise<T>): Promise<T> {
  if (!context.json) return fn();

  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args: unknown[]) => {
    process.stderr.write(`${args.map(String).join(' ')}\n`);
  };
  console.warn = (...args: unknown[]) => {
    process.stderr.write(`${args.map(String).join(' ')}\n`);
  };

  try {
    return await fn();
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
}
