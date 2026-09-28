/**
 * MarketLink Phase 3 — Marketplace API Client
 * All functions use the existing fetchApi utility.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
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

// ─── Farmers ──────────────────────────────────────────────────────
export const farmersApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/farmers${q}`);
  },
  getById: (id: string) => request(`/farmers/${id}`),
  getMyProfile: () => request('/farmers/me/profile'),
  updateProfile: (data: any) =>
    request('/farmers/me/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getMyInventory: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/farmers/me/inventory${q}`);
  },
  getMyOrders: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/farmers/me/orders${q}`);
  },
};

// ─── Markets ──────────────────────────────────────────────────────
export const marketsApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/markets${q}`);
  },
  getById: (id: string) => request(`/markets/${id}`),
  create: (data: any) =>
    request('/markets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/markets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/markets/${id}`, { method: 'DELETE' }),
  getStalls: (marketId: string) => request(`/markets/${marketId}/stalls`),
  createStall: (marketId: string, data: any) =>
    request(`/markets/${marketId}/stalls`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Products ─────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/products${q}`);
  },
  getBySlug: (slug: string) => request(`/products/${slug}`),
  create: (data: any) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/products/${id}`, { method: 'DELETE' }),
  getReviews: (productId: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/products/${productId}/reviews${q}`);
  },
  createReview: (productId: string, data: any) =>
    request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Inventory ────────────────────────────────────────────────────
export const inventoryApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/inventory${q}`);
  },
  getById: (id: string) => request(`/inventory/${id}`),
  create: (data: any) =>
    request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/inventory/${id}`, { method: 'DELETE' }),
};

// ─── Orders ───────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: any) =>
    request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders${q}`);
  },
  getById: (id: string) => request(`/orders/${id}`),
  getMyOrders: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders/me${q}`);
  },
  cancel: (id: string, data?: { cancellationReason?: string }) =>
    request(`/orders/${id}/cancel`, { method: 'PATCH', body: JSON.stringify(data || {}) }),
  updateStatus: (id: string, data: { status: string; farmerNotes?: string }) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Favorites ────────────────────────────────────────────────────
export const favoritesApi = {
  list: () => request('/favorites'),
  add: (productId: string) =>
    request('/favorites', { method: 'POST', body: JSON.stringify({ productId }) }),
  remove: (productId: string) =>
    request(`/favorites/${productId}`, { method: 'DELETE' }),
  check: (productId: string) => request(`/favorites/check/${productId}`),
};

// ─── Notifications ────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/notifications${q}`);
  },
  markRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),
};

// ─── Stalls ───────────────────────────────────────────────────────
export const stallsApi = {
  update: (id: string, data: any) =>
    request(`/stalls/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/stalls/${id}`, { method: 'DELETE' }),
};
