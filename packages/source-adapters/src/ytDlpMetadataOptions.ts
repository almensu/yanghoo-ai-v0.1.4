import { spawnSync, SpawnSyncReturns } from 'child_process';

export function runYtDlpMetadata(args: string[]): SpawnSyncReturns<string> {
  const attempts = buildMetadataAttempts(args);
  let lastResult: SpawnSyncReturns<string> | undefined;

  for (const attemptArgs of attempts) {
    const result = spawnSync('yt-dlp', attemptArgs, { encoding: 'utf-8' });
    if (result.status === 0) {
      return result;
    }
    lastResult = result;
  }

  return lastResult ?? spawnSync('yt-dlp', args, { encoding: 'utf-8' });
}

export function stringifyYtDlpArgs(args: string[]): string {
  return args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg)).join(' ');
}

function buildMetadataAttempts(args: string[]): string[][] {
  const baseArgs = buildBaseNetworkArgs();
  const proxy = resolveYtDlpProxy();

  if (proxy.mode === 'direct') {
    return [[...baseArgs, '--proxy', '', ...args]];
  }

  if (proxy.mode === 'proxy') {
    return [
      [...baseArgs, '--proxy', proxy.value, ...args],
      [...baseArgs, ...args]
    ];
  }

  return [[...baseArgs, ...args]];
}

function buildBaseNetworkArgs(): string[] {
  const args = [
    '--socket-timeout', process.env.YTDLP_SOCKET_TIMEOUT || '30',
    '--retries', process.env.YTDLP_RETRIES || '10',
    '--extractor-retries', process.env.YTDLP_EXTRACTOR_RETRIES || '5',
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
  if (envProxy) {
    return { mode: 'proxy', value: envProxy };
  }

  return { mode: 'proxy', value: 'http://127.0.0.1:7897' };
}
