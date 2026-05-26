import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, createRateLimitResponse } from '@/lib/rate-limit'

const usernameCheckRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'check-username' })

export async function POST(request: NextRequest) {
  // SECURITY: Rate limit to prevent username enumeration attacks
  const limitResult = await usernameCheckRateLimit(request)
  if (!limitResult.success) {
    return createRateLimitResponse({
      limit: limitResult.limit,
      remaining: limitResult.remaining,
      resetTime: limitResult.resetTime,
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  const { username } = body as Record<string, unknown>

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  // SECURITY: Validate username length to prevent abuse
  if (username.length > 100) {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase()
    },
    select: {
      id: true
    }
  })

  return NextResponse.json({
    available: !user
  })
}
