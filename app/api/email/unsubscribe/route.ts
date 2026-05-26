import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit"

const unsubscribeRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'email-unsubscribe' })

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

function isPrerenderInterruption(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const digest = "digest" in error ? String((error as { digest?: unknown }).digest ?? "") : ""
  return digest === "HANGING_PROMISE_REJECTION" || digest === "NEXT_PRERENDER_INTERRUPTED"
}

function getRequestUrl(request: Request): URL {
  const nextUrl = (request as Request & { nextUrl?: URL }).nextUrl
  if (nextUrl) return nextUrl
  return new URL(request.url)
}

export async function GET(request: Request) {
  const rl = await unsubscribeRateLimit(request)
  if (!rl.success) {
    return createRateLimitResponse({ limit: rl.limit, remaining: rl.remaining, resetTime: rl.resetTime })
  }

  try {
    const requestUrl = getRequestUrl(request)
    const searchParams = requestUrl.searchParams
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email) || !TOKEN_REGEX.test(token)) {
      return NextResponse.json(
        { error: 'Malformed unsubscribe payload' },
        { status: 400 }
      )
    }

    if (!verifyUnsubscribeToken(token, email)) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 401 }
      )
    }

    // Update or create newsletter record with isActive = false
    await prisma.newsletter.upsert({
      where: { email },
      update: { isActive: false },
      create: {
        email,
        isActive: false
      }
    })

    // Redirect to the newsletter preferences page (do NOT expose email in URL)
    const redirectUrl = new URL('/newsletter', requestUrl.origin)
    redirectUrl.searchParams.set('status', 'unsubscribed')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    if (isPrerenderInterruption(error)) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 400 }
      )
    }

    logger.error('[api/email/unsubscribe] Unsubscribe failed', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
