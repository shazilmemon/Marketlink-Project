export interface AIResponse<T = any> {
  success: boolean;
  provider: string;
  data: T;
  rawText?: string;
}

export interface IAIProvider {
  name: string;
  generateResponse(prompt: string, systemInstruction?: string): Promise<AIResponse<string>>;
  generateEmbedding(text: string): Promise<number[]>;
  summarize(text: string): Promise<string>;
  classify(text: string, categories: string[]): Promise<string>;
}
