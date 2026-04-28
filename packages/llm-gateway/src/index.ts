import { Message } from '@yanghoo/domain';

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
}

export interface GenerateOptions {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Interface for LLM Providers (OpenAI, Gemini, Local, etc.)
 */
export interface LLMProvider {
  id: string;
  name: string;
  listModels(): Promise<LLMModel[]>;
  generateContent(messages: Message[], options: GenerateOptions): Promise<string>;
}

/**
 * Unified LLM Gateway
 */
export class LLMGateway {
  private providers = new Map<string, LLMProvider>();

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.id, provider);
  }

  async listModels(): Promise<LLMModel[]> {
    const allModels: LLMModel[] = [];
    for (const provider of this.providers.values()) {
      const models = await provider.listModels();
      allModels.push(...models);
    }
    return allModels;
  }

  async generateContent(providerId: string, messages: Message[], options: GenerateOptions): Promise<string> {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Provider not found: ${providerId}`);
    return provider.generateContent(messages, options);
  }
}

export const llmGateway = new LLMGateway();
