import { execFileSync } from 'child_process';

export interface YtDlpExecutionOptions {
  timeoutMs: number;
  preferProxy?: boolean;
}

export function runYtDlp(args: string[], options: YtDlpExecutionOptions): Buffer {
  const attempts = buildYtDlpAttempts(args, options.preferProxy ?? true);
  const errors: string[] = [];

  for (const attemptArgs of attempts) {
    try {
      return execFileSync('yt-dlp', attemptArgs, {
        stdio: 'pipe',
        timeout: options.timeoutMs,
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (error: any) {
      const stderr = error.stderr?.toString() || error.stdout?.toString() || error.message;
      errors.push(`yt-dlp ${redactCookieArgs(attemptArgs).join(' ')}\n${stderr}`);
    }
  }

  throw new Error(errors.join('\n\n--- retry boundary ---\n\n'));
}

export function buildYtDlpBaseNetworkArgs(): string[] {
  const args = [
    '--socket-timeout', process.env.YTDLP_SOCKET_TIMEOUT || '30',
    '--retries', process.env.YTDLP_RETRIES || '10',
    '--fragment-retries', process.env.YTDLP_FRAGMENT_RETRIES || '10',
    '--extractor-retries', process.env.YTDLP_EXTRACTOR_RETRIES || '5',
    '--retry-sleep', 'http:linear=1::2',
    '--retry-sleep', 'fragment:exp=1:20',
    '--user-agent', process.env.YTDLP_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  if (process.env.YTDLP_FORCE_IPV4 !== '0') {
    args.push('--force-ipv4');
  }

  const cookiesPath = process.env.YTDLP_COOKIES;
  if (cookiesPath) {
    args.push('--cookies', cookiesPath);
  }

  const cookiesFromBrowser = process.env.YTDLP_COOKIES_FROM_BROWSER;
  if (cookiesFromBrowser) {
    args.push('--cookies-from-browser', cookiesFromBrowser);
  }

  return args;
}

function buildYtDlpAttempts(args: string[], preferProxy: boolean): string[][] {
  const baseArgs = buildYtDlpBaseNetworkArgs();
  const proxy = resolveYtDlpProxy();
  const attempts: string[][] = [];

  if (preferProxy && proxy.mode === 'proxy') {
    attempts.push([...baseArgs, '--proxy', proxy.value, ...args]);
    attempts.push([...baseArgs, ...args]);
  } else if (proxy.mode === 'direct') {
    attempts.push([...baseArgs, '--proxy', '', ...args]);
  } else {
    attempts.push([...baseArgs, ...args]);
  }

  return attempts;
}

function resolveYtDlpProxy(): { mode: 'proxy'; value: string } | { mode: 'direct' } | { mode: 'system' } {
  const explicitProxy = process.env.YTDLP_PROXY?.trim();
  if (explicitProxy) {
    const normalized = explicitProxy.toLowerCase();
    if (normalized === 'direct' || normalized === 'none' || normalized === 'off') {
      return { mode: 'direct' };
    }
    return { mode: 'proxy', value: explicitProxy };
  }

  const envProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
  if (envProxy) return { mode: 'proxy', value: envProxy };

  // Match the existing YouTube InnerTube adapter default used in this project.
  return { mode: 'proxy', value: 'http://127.0.0.1:7897' };
}

function redactCookieArgs(args: string[]): string[] {
  const redacted: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    redacted.push(arg);
    if (arg === '--cookies' || arg === '--cookies-from-browser') {
      redacted.push('[redacted]');
      index += 1;
    }
  }
  return redacted;
}
