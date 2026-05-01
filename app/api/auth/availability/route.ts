import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RESERVED_USERNAMES = new Set([
  'admin', 'root', 'system', 'moderator', 'mod', 'support',
  'help', 'info', 'about', 'blog', 'news', 'api', 'app',
  'dashboard', 'settings', 'login', 'signup', 'register',
  'trade', 'trader', 'trading', 'analytics', 'journal',
  'qunt', 'quntedge', 'qunt-edge', 'edge',
])

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.trim().toLowerCase()

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  if (username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json({ error: 'Invalid characters' }, { status: 400 })
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ available: false, reason: 'reserved' })
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { usernameHash: username },
        ],
      },
      select: { id: true },
    })

    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
