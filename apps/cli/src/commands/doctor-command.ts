import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

interface DoctorCheck {
  name: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
}

export async function runDoctorCommand(_args: string[], context: CliContext): Promise<void> {
  const checks: DoctorCheck[] = [
    checkDataDir(),
    checkCommand('yt-dlp', ['--version'], 'yt-dlp media downloader'),
    checkCommand('ffmpeg', ['-version'], 'ffmpeg audio/video processing'),
    checkCommand('ffprobe', ['-version'], 'ffprobe media metadata'),
    checkPythonRuntime('MLX_AUDIO_PYTHON', 'import mlx_audio; import mlx.core', 'MLX Audio transcription'),
    checkPythonRuntime('MLX_LM_PYTHON', 'import mlx_lm; import mlx.core', 'MLX LM translation')
  ];

  const payload = {
    ok: checks.every(check => check.status !== 'error'),
    checks
  };

  const lines = [
    'Yanghoo CLI doctor',
    ...checks.map(check => `${symbolForStatus(check.status)} ${check.name}: ${check.message}`)
  ];

  printResult(context, payload, lines);
}

function checkDataDir(): DoctorCheck {
  const dataDir = path.resolve(process.env.DATA_DIR || 'data');
  if (!fs.existsSync(dataDir)) {
    return {
      name: 'DATA_DIR',
      status: 'warn',
      message: `${dataDir} does not exist yet`
    };
  }

  try {
    fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
    return {
      name: 'DATA_DIR',
      status: 'ok',
      message: dataDir
    };
  } catch (error: any) {
    return {
      name: 'DATA_DIR',
      status: 'error',
      message: error.message
    };
  }
}

function checkCommand(command: string, args: string[], label: string): DoctorCheck {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    timeout: 10_000
  });

  if (result.error) {
    return {
      name: command,
      status: 'warn',
      message: `${label} not available: ${result.error.message}`
    };
  }

  if (result.status !== 0) {
    return {
      name: command,
      status: 'warn',
      message: `${label} returned exit code ${result.status}`
    };
  }

  const firstLine = `${result.stdout || result.stderr}`.split('\n').find(Boolean)?.trim();
  return {
    name: command,
    status: 'ok',
    message: firstLine || label
  };
}

function checkPythonRuntime(envName: string, importCheck: string, label: string): DoctorCheck {
  const pythonExec = process.env[envName];
  if (!pythonExec) {
    return {
      name: envName,
      status: 'warn',
      message: `${label} is not configured`
    };
  }

  const result = spawnSync(pythonExec, ['-c', importCheck], {
    encoding: 'utf-8',
    timeout: 10_000
  });

  if (result.error || result.status !== 0) {
    return {
      name: envName,
      status: 'error',
      message: result.stderr?.trim() || result.error?.message || `${label} import check failed`
    };
  }

  return {
    name: envName,
    status: 'ok',
    message: pythonExec
  };
}

function symbolForStatus(status: DoctorCheck['status']): string {
  if (status === 'ok') return '[ok]';
  if (status === 'warn') return '[warn]';
  return '[error]';
}
