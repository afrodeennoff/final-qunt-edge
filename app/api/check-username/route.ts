import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { username } = await request.json()

  if (!username || typeof username !== 'string') {
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