import { IAIProvider, AIResponse } from './AIProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export class GeminiProvider implements IAIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');
  }

  async generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse<string>> {
    try {
      if (process.env.GEMINI_API_KEY) {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction });
        const result = await model.generateContent(prompt);
        return { success: true, provider: this.name, data: result.response.text(), rawText: result.response.text() };
      }
      return { success: true, provider: this.name, data: 'Mock Gemini response: ' + prompt.substring(0, 50) };
    } catch (e: any) {
      return { success: false, provider: this.name, data: e.message };
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3]; // Mock
  }

  async summarize(text: string): Promise<string> {
    return 'Mock summary';
  }

  async classify(text: string, categories: string[]): Promise<string> {
    return categories[0];
  }
}
