/**
 * MarketLink Farmer AI Assistant API Service
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface AiForecastResponse {
  summary: string;
  projectedIncrease: number;
  topDemandItem: string;
  marketDayPrediction: string;
  confidenceScore: number;
  recommendations: string[];
  chartData: Array<{ day: string; actual: number; projected: number }>;
}

export interface AiPriceRecommendationResponse {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  priceChangePercent: number;
  marketScarcity: string;
  reasoning: string;
  recommendedAction: string;
}

export const farmerAiApi = {
  forecastDemand: async (category?: string): Promise<AiForecastResponse> => {
    const res = await fetch(`${API_BASE}/farmer/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'forecast_demand', payload: { category } }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Forecast failed');
    return json.data;
  },

  generateReviewReply: async (payload: { rating: number; comment: string; customerName?: string; productName?: string }): Promise<string> => {
    const res = await fetch(`${API_BASE}/farmer/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'generate_review_reply', payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Review reply generation failed');
    return json.data.reply;
  },

  recommendPrice: async (payload: { productName: string; category: string; currentPrice: number; unit: string; stockQuantity: number }): Promise<AiPriceRecommendationResponse> => {
    const res = await fetch(`${API_BASE}/farmer/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'price_recommendation', payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Price recommendation failed');
    return json.data;
  },
};
