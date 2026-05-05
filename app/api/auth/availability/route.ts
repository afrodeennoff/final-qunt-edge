import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple rate limiting: 5 requests per minute per IP
const RATE_LIMIT = 5
const TIME_WINDOW = 60 * 1000 // 1 minute
const ipRequests = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const requests = ipRequests.get(ip) || []

  // Remove old requests outside time window
  const validRequests = requests.filter(time => now - time < TIME_WINDOW)
  ipRequests.set(ip, validRequests)

  return validRequests.length < RATE_LIMIT
}

const RESERVED_USERNAMES = new Set([
  'admin', 'root', 'system', 'moderator', 'mod', 'support',
  'help', 'info', 'about', 'blog', 'news', 'api', 'app',
  'dashboard', 'settings', 'login', 'signup', 'register',
  'trade', 'trader', 'trading', 'analytics', 'journal',
  'qunt', 'quntedge', 'qunt-edge', 'edge',
])

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
  }

  // Track request
  const now = Date.now()
  const requests = ipRequests.get(ip) || []
  requests.push(now)
  ipRequests.set(ip, requests)

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.trim().toLowerCase()

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  // Enhanced validation
  if (username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 })
  }

  // Additional security checks
  if (username.length === 0 || username.trim() !== username) {
    return NextResponse.json({ error: 'Username cannot start or end with spaces' }, { status: 400 })
  }

  // Prevent common username patterns that might be used for attacks
  if (username.startsWith('admin') || username.startsWith('root') ||
      username.startsWith('system') || username.includes('..') ||
      username.includes('//') || username.includes('\\')) {
    return NextResponse.json({ error: 'Invalid username pattern' }, { status: 400 })
  }

  // Input sanitization and validation
  const sanitizedUsername = username.trim().toLowerCase()

  if (sanitizedUsername !== username) {
    return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: 'Invalid characters' }, { status: 400 })
  }

  if (RESERVED_USERNAMES.has(sanitizedUsername)) {
    return NextResponse.json({ available: false, reason: 'reserved' })
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: sanitizedUsername },
          { usernameHash: sanitizedUsername },
        ],
      },
      select: { id: true },
    })

    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
