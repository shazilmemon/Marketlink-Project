import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface AIResponse<T = any> {
  success: boolean;
  provider: string;
  data: T;
  rawText?: string;
}

export interface IAIServiceProvider {
  name: string;
  generateText(prompt: string, context?: Record<string, any>): Promise<AIResponse<string>>;
  analyzeDemandForecast(historicalData: any[]): Promise<AIResponse<any>>;
  generateVendorInsights(vendorMetrics: any): Promise<AIResponse<any>>;
}

export class MockAIProvider implements IAIServiceProvider {
  public name = 'mock';

  public async generateText(prompt: string): Promise<AIResponse<string>> {
    return {
      success: true,
      provider: this.name,
      data: `[Mock AI Response] Response for: ${prompt.substring(0, 40)}...`,
    };
  }

  public async analyzeDemandForecast(historicalData: any[]): Promise<AIResponse<any>> {
    if (!historicalData || historicalData.length < 5) {
      return {
        success: true,
        provider: this.name,
        data: {
          confidenceScore: 0,
          status: 'INSUFFICIENT_DATA',
          message: 'Insufficient historical data for reliable forecasting.',
          predictedDemand: [],
        },
      };
    }
    return {
      success: true,
      provider: this.name,
      data: {
        confidenceScore: 0.85,
        status: 'SUFFICIENT_DATA',
        predictedDemand: historicalData.map((d) => ({
          date: d.date,
          projectedUnits: Math.round(d.units * 1.1),
        })),
      },
    };
  }

  public async generateVendorInsights(vendorMetrics: any): Promise<AIResponse<any>> {
    return {
      success: true,
      provider: this.name,
      data: {
        insights: [
          'High demand projected for organic leafy greens this weekend.',
          'Consider bundling heirloom tomatoes with fresh basil for pre-orders.',
        ],
        metricsSummary: vendorMetrics,
      },
    };
  }
}

export class AIService {
  private static providerInstance: IAIServiceProvider;

  public static getProvider(): IAIServiceProvider {
    if (!this.providerInstance) {
      const selected = env.AI_PROVIDER;
      logger.info(`🤖 Initializing AIService with provider: ${selected}`);
      
      switch (selected) {
        case 'gemini':
          // Ready for Gemini AI Provider implementation
          this.providerInstance = new MockAIProvider(); 
          break;
        case 'openai':
          // Ready for OpenAI Provider implementation
          this.providerInstance = new MockAIProvider();
          break;
        case 'mock':
        default:
          this.providerInstance = new MockAIProvider();
          break;
      }
    }
    return this.providerInstance;
  }
}
