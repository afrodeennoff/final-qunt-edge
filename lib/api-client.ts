export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(public timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
  }
}

interface ApiSuccessResponse<T> {
  success: true
  data?: T
  message?: string
}

interface ApiErrorResponse {
  success: false
  error?: { code: string; message: string; details?: unknown }
  message?: string
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: RequestCache
}

const DEFAULT_TIMEOUT = 30_000
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY = 1_000
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504])

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return path
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `${path}?${qs}` : path
}

async function parseErrorBody(response: Response): Promise<{ code: string; message: string; details?: unknown }> {
  try {
    const body = await response.json()

    if (body?.error?.code && body?.error?.message) {
      return { code: body.error.code, message: body.error.message, details: body.error.details }
    }

    if (body?.message) {
      return { code: 'API_ERROR', message: body.message }
    }

    return { code: 'UNKNOWN', message: `Request failed with status ${response.status}` }
  } catch {
    return { code: 'UNKNOWN', message: `Request failed with status ${response.status}` }
  }
}

function shouldRetry(status: number): boolean {
  return RETRYABLE_STATUSES.has(status)
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    signal: externalSignal,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    cache,
  } = options

  const url = buildUrl(path, params)

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache,
  }

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(new TimeoutError(timeout)), timeout)

    const combinedSignal = externalSignal
      ? combineAbortSignals(externalSignal, controller.signal)
      : controller.signal

    try {
      const response = await fetch(url, { ...fetchOptions, signal: combinedSignal })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await parseErrorBody(response)

        if (attempt < retries && shouldRetry(response.status)) {
          await delay(retryDelay * Math.pow(2, attempt))
          continue
        }

        throw new ApiError(response.status, errorBody.code, errorBody.message, errorBody.details)
      }

      if (response.status === 204) {
        return undefined as T
      }

      const json: ApiResponse<T> = await response.json()

      if (!json || (json as ApiErrorResponse).success === false) {
        const errBody = json as ApiErrorResponse
        throw new ApiError(
          response.status,
          errBody.error?.code || 'API_ERROR',
          errBody.error?.message || errBody.message || 'Request failed',
          errBody.error?.details,
        )
      }

      return (json as ApiSuccessResponse<T>).data !== undefined
        ? (json as ApiSuccessResponse<T>).data as T
        : json as unknown as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (externalSignal?.aborted) {
          throw error
        }
        throw new TimeoutError(timeout)
      }

      if (attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt))
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed',
        error,
      )
    }
  }

  throw lastError || new Error('Request failed')
}

function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  return controller.signal
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const api = {
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'GET' })
  },

  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'POST', body })
  },

  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'PUT', body })
  },

  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'PATCH', body })
  },

  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'DELETE' })
  },
}

export default api
