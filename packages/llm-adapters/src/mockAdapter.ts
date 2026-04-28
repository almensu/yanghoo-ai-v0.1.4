import { Message } from '@yanghoo/domain';
import { LLMProvider, LLMModel, GenerateOptions } from '@yanghoo/llm-gateway';

export class MockLLMProvider implements LLMProvider {
  id = 'mock-provider';
  name = 'Mock Provider';

  async listModels(): Promise<LLMModel[]> {
    return [
      { id: 'mock-gpt-4', name: 'Mock GPT-4', provider: this.id },
      { id: 'mock-llama-3', name: 'Mock Llama 3', provider: this.id }
    ];
  }

  async generateContent(messages: Message[], options: GenerateOptions): Promise<string> {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const content = lastUserMessage?.content || '';
    
    console.log(`[MockLLM] Generating content for model: ${options.modelId}`);
    
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    if (content.toLowerCase().includes('summary')) {
      return "This is a mock summary of the document. It highlights the key points regarding URL collection and transcription pipelines.";
    }

    return `I received your message: "${content}". This is a mock response from ${options.modelId}. Currently, I can simulate understanding the context of your source document.`;
  }
}

export const mockLLMProvider = new MockLLMProvider();
