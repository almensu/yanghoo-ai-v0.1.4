import { Message } from '@yanghoo/domain';
import { LLMProvider, LLMModel, GenerateOptions } from '@yanghoo/llm-gateway';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface MlxLmProviderOptions {
  pythonExec?: string;
  scriptPath?: string;
}

export class MlxLmProvider implements LLMProvider {
  id = 'mlx-lm';
  name = 'MLX LM (Local)';
  
  private pythonExec: string;
  private scriptPath: string;

  constructor(options: MlxLmProviderOptions) {
    this.pythonExec = options.pythonExec || process.env.MLX_LM_PYTHON || 'python3';
    this.scriptPath = options.scriptPath || '';
  }

  async listModels(): Promise<LLMModel[]> {
    return [
      { id: 'Qwen/Qwen3-4B-MLX-4bit', name: 'Qwen3 4B (4-bit)', provider: this.id },
      { id: 'mlx-community/Qwen2.5-3B-Instruct-4bit', name: 'Qwen2.5 3B (4-bit)', provider: this.id }
    ];
  }

  async generateContent(messages: Message[], options: GenerateOptions): Promise<string> {
    console.log(`[MlxLmProvider] Generating content with model: ${options.modelId}`);

    if (!this.scriptPath || !fs.existsSync(this.scriptPath)) {
      throw new Error(`MLX LM script not found at: ${this.scriptPath}`);
    }

    const systemContent = messages
      .filter(m => m.role === 'system' && m.content)
      .map(m => m.content)
      .join('\n\n');
    const userContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    if (!userContent.trim()) {
      throw new Error('MLX LM generation requires at least one user message');
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yanghoo-mlx-lm-'));
    const systemPromptPath = path.join(tempDir, 'system-prompt.md');
    const userPromptPath = path.join(tempDir, 'user-prompt.md');
    const outputJsonPath = path.join(tempDir, 'output.json');

    try {
      fs.writeFileSync(userPromptPath, userContent, 'utf-8');
      if (systemContent.trim()) {
        fs.writeFileSync(systemPromptPath, systemContent, 'utf-8');
      }

      const args = [
        this.scriptPath,
        '--model', options.modelId,
        '--user-prompt-file', userPromptPath,
        '--output-json', outputJsonPath,
        '--temp', String(options.temperature ?? 0.1),
        '--max-tokens', String(options.maxTokens ?? 5000)
      ];
      if (systemContent.trim()) {
        args.push('--system-prompt-file', systemPromptPath);
      }

      console.log(`[MlxLmProvider] Running: ${this.pythonExec} ${this.scriptPath} --model ${options.modelId} --user-prompt-file <temp> --max-tokens ${options.maxTokens ?? 5000}`);
      const processResult = spawnSync(this.pythonExec, args, {
        encoding: 'utf-8',
        timeout: 900_000,
        maxBuffer: 20 * 1024 * 1024
      });

      if (processResult.error) {
        throw processResult.error;
      }

      if (processResult.status !== 0) {
        throw new Error(processResult.stderr || processResult.stdout || `MLX LM exited with status ${processResult.status}`);
      }

      if (!fs.existsSync(outputJsonPath)) {
        throw new Error('MLX LM output JSON not found');
      }

      const generationResult = JSON.parse(fs.readFileSync(outputJsonPath, 'utf-8'));

      return generationResult.content || '';
    } catch (error: any) {
      const stderr = error.stderr?.toString() || error.message;
      console.error(`[MlxLmProvider] Generation failed: ${stderr}`);
      throw new Error(`MLX LM generation failed: ${stderr.substring(0, 500)}`);
    } finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  }
}
