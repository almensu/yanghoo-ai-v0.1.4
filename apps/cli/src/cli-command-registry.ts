import { presentCliError, withJsonSafeLogs } from './cli-error-presenter.js';
import { extractGlobalArgs } from './cli-runtime-config.js';
import { printHelp } from './cli-output-renderer.js';
import { runAudioCommand } from './commands/audio-command.js';
import { runDoctorCommand } from './commands/doctor-command.js';
import { runExportCommand } from './commands/notebooklm-export-command.js';
import { runMediaCommand } from './commands/media-command.js';
import { runSearchCommand } from './commands/search-command.js';
import { runSourceCommand } from './commands/source-command.js';
import { runTranscriptCommand } from './commands/transcript-command.js';
import { runTranscribeCommand } from './commands/transcribe-command.js';
import { runTranslateCommand } from './commands/translate-command.js';
import { runChannelCommand } from './commands/channel-command.js';
import { runSentenceIndexCommand } from './commands/sentence-index-command.js';

export async function runCli(argv: string[]): Promise<number> {
  let parsed: ReturnType<typeof extractGlobalArgs>;

  try {
    parsed = extractGlobalArgs(argv);
  } catch (error) {
    presentCliError(error, { json: argv.includes('--json'), cwd: process.cwd() });
    return 1;
  }

  const { context, args } = parsed;

  try {
    await withJsonSafeLogs(context, async () => {
      const [command, ...rest] = args;

      if (!command || command === 'help' || command === '--help' || command === '-h') {
        printHelp(context);
        return;
      }

      if (command === 'doctor') {
        await runDoctorCommand(rest, context);
        return;
      }

      if (command === 'source') {
        await runSourceCommand(rest, context);
        return;
      }

      if (command === 'channel') {
        await runChannelCommand(rest, context);
        return;
      }

      if (command === 'sentence-index') {
        await runSentenceIndexCommand(rest, context);
        return;
      }

      if (command === 'transcript') {
        await runTranscriptCommand(rest, context);
        return;
      }

      if (command === 'media') {
        await runMediaCommand(rest, context);
        return;
      }

      if (command === 'audio') {
        await runAudioCommand(rest, context);
        return;
      }

      if (command === 'transcribe') {
        await runTranscribeCommand(rest, context);
        return;
      }

      if (command === 'translate') {
        await runTranslateCommand(rest, context);
        return;
      }

      if (command === 'search') {
        await runSearchCommand(rest, context);
        return;
      }

      if (command === 'export') {
        await runExportCommand(rest, context);
        return;
      }

      throw new Error(`Unknown command: ${command}`);
    });
    return 0;
  } catch (error) {
    presentCliError(error, context);
    return 1;
  }
}
