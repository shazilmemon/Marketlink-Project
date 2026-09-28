const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  service?: string;
  environment?: string;
  database?: string;
  timestamp?: string;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Support absolute URLs, relative paths, and API base URL construction
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (endpoint.startsWith('/') && !endpoint.startsWith('/api')) {
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Always include cookies for session auth
    });

    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }

    if (!response.ok || !data.success) {
      const errMsg = data?.message || `API error (${response.status})`;
      const err = new Error(errMsg) as any;
      err.status = response.status;
      err.errorCode = data?.errorCode;
      throw err;
    }

    return data;
  } catch (error: any) {
    // Only log non-auth errors to avoid noise from unauthenticated /auth/me calls
    if (error.status !== 401) {
      console.error(`API Fetch Error [${endpoint}]:`, error.message);
    }
    throw error;
  }
}
