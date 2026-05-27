/**
 * API Route Wrapper — Normalized request handling for all API routes.
 *
 * Provides:
 * - Request ID generation (X-Request-Id header)
 * - Structured logging with request context
 * - Latency measurement
 * - Rate limiting integration
 * - Consistent error envelope
 * - Cache-Status header
 *
 * @module lib/api/with-api-route
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiError, type ApiErrorCode } from '@/lib/api-response'
import { rateLimit, createRateLimitResponse, getTrustedClientIp } from '@/lib/rate-limit'
import { createLogger, withLogContext, type LoggerContext } from '@/lib/logger'

const log = createLogger('api-route')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiRouteContext {
  /** Unique request identifier */
  requestId: string
  /** Authenticated user ID (if auth passed) */
  userId?: string
  /** Client IP for logging */
  clientIp: string
  /** Original request */
  request: NextRequest
}

export interface ApiRouteConfig {
  /** Rate limit identifier (e.g., 'deals-read', 'checkout') */
  rateLimitId?: string
  /** Max requests per window */
  rateLimitMax?: number
  /** Rate limit window in ms */
  rateLimitWindow?: number
  /** Max body size in bytes (default: 1MB) */
  maxBodySize?: number
  /** Whether to require authentication */
  requireAuth?: boolean
  /** Route name for logging */
  routeName?: string
}

export interface ApiSuccessOptions {
  /** Additional headers */
  headers?: HeadersInit
  /** Cache status for Cache-Status header */
  cacheStatus?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRequestId(): string {
  return crypto.randomUUID()
}

/**
 * Create a standardized success response.
 */
export function apiSuccess<T>(data: T, status = 200, options?: ApiSuccessOptions): NextResponse {
  const headers = new Headers(options?.headers)
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-store, max-age=0')
  }

  if (options?.cacheStatus) {
    headers.set('Cache-Status', options.cacheStatus)
  }

  return NextResponse.json(data, { status, headers })
}

/**
 * Create a standardized error response with requestId.
 */
export function apiErrorWithId(
  requestId: string,
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
  headers?: HeadersInit,
): NextResponse {
  const response = apiError(code, message, status, details, headers)
  response.headers.set('X-Request-Id', requestId)
  return response
}

// ---------------------------------------------------------------------------
// withApiRoute — Main wrapper
// ---------------------------------------------------------------------------

/**
 * Wrap an API route handler with standardized request handling.
 *
 * @example
 * ```ts
 * export const GET = withApiRoute(
 *   async (ctx) => {
 *     const data = await loadData(ctx.userId!)
 *     return apiSuccess(data)
 *   },
 *   { rateLimitId: 'deals-read', rateLimitMax: 120, routeName: 'deals-list' }
 * )
 * ```
 */
export function withApiRoute(
  handler: (ctx: ApiRouteContext) => Promise<NextResponse>,
  config: ApiRouteConfig = {},
): (request: NextRequest) => Promise<NextResponse> {
  const {
    rateLimitId,
    rateLimitMax = 120,
    rateLimitWindow = 60_000,
    maxBodySize = 1_000_000,
    routeName = 'unknown',
  } = config

  // Create limiter once when the route module loads, not per request
  const limiter = rateLimitId
    ? rateLimit({ limit: rateLimitMax, window: rateLimitWindow, identifier: rateLimitId })
    : null

  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId()
    const startTime = Date.now()
    const clientIp = getTrustedClientIp(request)
    const method = request.method

    const logCtx: LoggerContext = {
      requestId,
      route: routeName,
      method,
      clientIp,
    }

    return withLogContext(logCtx, async () => {
      try {
        // Rate limiting
        if (limiter) {

          const result = await limiter(request)
          if (!result.success) {
            log.warn('Rate limit exceeded', { routeName, clientIp })
            const response = await createRateLimitResponse({
              limit: result.limit,
              remaining: result.remaining,
              resetTime: result.resetTime,
            })
            response.headers.set('X-Request-Id', requestId)
            return response
          }
        }

        // Body size check
        const contentLength = request.headers.get('content-length')
        if (contentLength && Number(contentLength) > maxBodySize) {
          log.warn('Request body too large', { routeName, contentLength, maxBodySize })
          return apiErrorWithId(
            requestId,
            'PAYLOAD_TOO_LARGE',
            `Request body exceeds maximum size of ${maxBodySize} bytes`,
            413,
          )
        }

        // Build context
        const ctx: ApiRouteContext = {
          requestId,
          clientIp,
          request,
        }

        // Execute handler
        const response = await handler(ctx)

        // Add standard headers
        if (!response.headers.has('X-Request-Id')) {
          response.headers.set('X-Request-Id', requestId)
        }

        // Log timing
        const durationMs = Date.now() - startTime
        log.info('Request completed', {
          routeName,
          method,
          status: response.status,
          durationMs,
        })

        return response
      } catch (error) {
        const durationMs = Date.now() - startTime
        log.error('Unhandled API error', {
          routeName,
          method,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
        })

        return apiErrorWithId(requestId, 'INTERNAL_ERROR', 'An unexpected error occurred', 500)
      }
    })
  }
}

/**
 * Wrap an API route handler with rate limiting only (lighter wrapper).
 * Useful for routes that already have auth/error handling but need rate limiting + request ID.
 */
export function withRateLimited(
  handler: (request: NextRequest) => Promise<NextResponse | Response>,
  config: {
    rateLimitId: string
    rateLimitMax?: number
    rateLimitWindow?: number
    routeName?: string
  },
): (request: NextRequest) => Promise<NextResponse | Response>

export function withRateLimited<TCtx>(
  handler: (request: NextRequest, ctx: TCtx) => Promise<NextResponse | Response>,
  config: {
    rateLimitId: string
    rateLimitMax?: number
    rateLimitWindow?: number
    routeName?: string
  },
): (request: NextRequest, ctx: TCtx) => Promise<NextResponse | Response>

export function withRateLimited<TCtx>(
  handler:
    | ((request: NextRequest) => Promise<NextResponse | Response>)
    | ((request: NextRequest, ctx: TCtx) => Promise<NextResponse | Response>),
  config: {
    rateLimitId: string
    rateLimitMax?: number
    rateLimitWindow?: number
    routeName?: string
  },
):
  | ((request: NextRequest) => Promise<NextResponse | Response>)
  | ((request: NextRequest, ctx: TCtx) => Promise<NextResponse | Response>) {
  const {
    rateLimitId,
    rateLimitMax = 120,
    rateLimitWindow = 60_000,
    routeName = config.rateLimitId,
  } = config

  return async (request: NextRequest, ctx?: TCtx): Promise<NextResponse | Response> => {
    const requestId = generateRequestId()

    // Rate limiting
    const limiter = rateLimit({
      limit: rateLimitMax,
      window: rateLimitWindow,
      identifier: rateLimitId,
    })

    const result = await limiter(request)
    if (!result.success) {
      const response = await createRateLimitResponse({
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
      })
      response.headers.set('X-Request-Id', requestId)
      return response
    }

    const startTime = Date.now()
    try {
      const response =
        ctx === undefined
          ? await (handler as (request: NextRequest) => Promise<NextResponse | Response>)(request)
          : await (
              handler as (request: NextRequest, ctx: TCtx) => Promise<NextResponse | Response>
            )(request, ctx)
      if ('headers' in response && response.headers instanceof Headers) {
        if (!(response as NextResponse).headers.has('X-Request-Id')) {
          ;(response as NextResponse).headers.set('X-Request-Id', requestId)
        }
      }
      return response
    } catch (error) {
      const durationMs = Date.now() - startTime
      log.error('Unhandled API error', {
        routeName,
        method: request.method,
        durationMs,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiErrorWithId(requestId, 'INTERNAL_ERROR', 'An unexpected error occurred', 500)
    }
  }
}
