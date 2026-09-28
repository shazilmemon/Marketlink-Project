import { IAIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';

export class AIRequestService {
  private provider: IAIProvider;
  
  constructor() {
    this.provider = new GeminiProvider();
  }

  async getAssistantResponse(prompt: string, userId: string, role: string) {
    const systemInstruction = `You are a helpful MarketLink AI assistant for a ${role}. Do not invent information. Be grounded in reality.`;
    const response = await this.provider.generateResponse(prompt, systemInstruction);
    return response.data;
  }
}

export const aiRequestService = new AIRequestService();
