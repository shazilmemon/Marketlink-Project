/**
 * MarketLink Phase 5 — AI Demand Forecasting API Client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `API error (${response.status})`);
  }
  return data;
}

export const forecastingApi = {
  generate: (data: { productId: string; targetDate: string; marketId?: string }) =>
    request('/forecasting/farmer/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateBulk: (data: { productIds: string[]; targetDate: string; marketId?: string }) =>
    request('/forecasting/farmer/generate-bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFarmerForecasts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/forecasting/farmer${q}`);
  },
  getEvaluations: () => request('/forecasting/farmer/evaluations'),
  getById: (id: string) => request(`/forecasting/farmer/${id}`),
};
