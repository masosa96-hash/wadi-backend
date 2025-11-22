// API retry logic with exponential backoff

export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryableStatuses?: number[];
}

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export async function fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
): Promise<T> {
    const opts = { ...defaultOptions, ...retryOptions };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // If response is OK, return parsed JSON
            if (response.ok) {
                return await response.json();
            }

            // Check if status is retryable
            if (!opts.retryableStatuses.includes(response.status)) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // If it's the last attempt, throw
            if (attempt === opts.maxRetries) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
                opts.maxDelay
            );

            console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${opts.maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, delay));

        } catch (error) {
            lastError = error as Error;

            // If it's a network error and not the last attempt, retry
            if (attempt < opts.maxRetries) {
                const delay = Math.min(
                    opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
                    opts.maxDelay
                );
                console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${opts.maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error("Request failed after retries");
}

// Wrapper for common API calls
export async function apiGet<T>(endpoint: string, retryOptions?: RetryOptions): Promise<T> {
    const token = localStorage.getItem("wadi_token");
    return fetchWithRetry<T>(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        },
        retryOptions
    );
}

export async function apiPost<T>(
    endpoint: string,
    body: unknown,
    retryOptions?: RetryOptions
): Promise<T> {
    const token = localStorage.getItem("wadi_token");
    return fetchWithRetry<T>(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        },
        retryOptions
    );
}
