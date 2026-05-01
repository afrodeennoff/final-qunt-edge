import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'INTERNAL_ERROR'
  | string

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
  headers?: HeadersInit,
) {
  const resolvedHeaders = new Headers(headers)
  if (!resolvedHeaders.has('Cache-Control')) {
    resolvedHeaders.set('Cache-Control', 'no-store, max-age=0')
  }
  if (
    !resolvedHeaders.has('X-Request-Id') &&
    typeof details === 'object' &&
    details !== null &&
    'requestId' in details &&
    typeof (details as { requestId?: unknown }).requestId === 'string'
  ) {
    resolvedHeaders.set('X-Request-Id', (details as { requestId: string }).requestId)
  }
  const errorBody: Record<string, unknown> = { code, message }
  if (details !== undefined) {
    errorBody.details = details
  }

  return NextResponse.json({ error: errorBody }, { status, headers: resolvedHeaders })
}
