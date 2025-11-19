const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  code?: string;
  status: number;
  timestamp: string;
  retryable?: boolean;
}

/**
 * API Request Options
 */
interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retry?: boolean;
  retryCount?: number;
}

/**
 * Token refresh lock to prevent race conditions
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the authentication token
 */
async function refreshAuthToken(): Promise<boolean> {
  // If already refreshing, wait for it
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
    return true;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { supabase } = await import("./supabase");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('[API] Token refresh failed:', error);
        // Redirect to login on refresh failure
        window.location.href = '/login?session_expired=true';
        return false;
      }
      
      console.log('[API] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[API] Token refresh error:', error);
      window.location.href = '/login?session_expired=true';
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Check if token needs refresh (less than 5 minutes remaining)
 */
async function checkTokenExpiration(): Promise<void> {
  const { supabase } = await import("./supabase");
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) return;
  
  const expiresAt = data.session.expires_at;
  if (!expiresAt) return;
  
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;
  
  // Refresh if less than 5 minutes remaining
  if (timeUntilExpiry < 300) {
    console.log('[API] Token expiring soon, refreshing...');
    await refreshAuthToken();
  }
}

/**
 * Get the current auth token from Supabase
 */
async function getAuthToken(): Promise<string | null> {
  // Check token expiration before getting token
  await checkTokenExpiration();
  
  const { supabase } = await import("./supabase");
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log API request/response for debugging
 */
function logRequest(method: string, endpoint: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${endpoint}`, data ? { data } : '');
  }
}

function logResponse(method: string, endpoint: string, response: unknown, duration: number) {
  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${endpoint} - ${duration}ms`, { response });
  }
}

function logError(method: string, endpoint: string, error: unknown) {
  console.error(`[API Error] ${method} ${endpoint}`, error);
}

/**
 * Make authenticated API request with retry logic and timeout
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retry = true,
    retryCount = 0,
    ...fetchOptions
  } = options;

  const method = fetchOptions.method || 'GET';
  const startTime = Date.now();

  try {
    logRequest(method, endpoint, fetchOptions.body);

    const token = await getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...fetchOptions.headers as Record<string, string>,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        
        const apiError: ApiError = {
          error: errorData.error || `HTTP ${response.status}`,
          code: errorData.code || `HTTP_${response.status}`,
          status: response.status,
          timestamp: new Date().toISOString(),
          retryable: errorData.retryable,
        };

        // Handle token expiration
        if (response.status === 401 && errorData.code === 'AUTH_EXPIRED') {
          logError(method, endpoint, 'Token expired, attempting refresh...');
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            // Retry the request with new token
            return apiRequest<T>(endpoint, { ...options, retryCount: 0 });
          }
        }

        // Retry on 5xx errors or network issues
        if (retry && retryCount < MAX_RETRIES && (response.status >= 500 || response.status === 429)) {
          logError(method, endpoint, `Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
          return apiRequest<T>(endpoint, { ...options, retryCount: retryCount + 1 });
        }

        logError(method, endpoint, apiError);
        throw apiError;
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      logResponse(method, endpoint, data, duration);
      
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    // Handle timeout and network errors
    if (error.name === 'AbortError') {
      const timeoutError: ApiError = {
        error: 'Request timeout',
        code: 'TIMEOUT',
        status: 0,
        timestamp: new Date().toISOString(),
      };
      logError(method, endpoint, timeoutError);
      throw timeoutError;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError: ApiError = {
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0,
        timestamp: new Date().toISOString(),
      };
      logError(method, endpoint, networkError);
      throw networkError;
    }

    // Re-throw ApiError instances
    if ('status' in error && 'timestamp' in error) {
      throw error;
    }

    // Wrap unknown errors
    const unknownError: ApiError = {
      error: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
      timestamp: new Date().toISOString(),
    };
    logError(method, endpoint, unknownError);
    throw unknownError;
  }
}

/**
 * Centralized API client with all HTTP methods
 */
export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  
  post: <T>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T>(endpoint: string, data?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
