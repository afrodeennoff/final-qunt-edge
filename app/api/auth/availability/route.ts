import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { usernameSchema } from '@/lib/validations/user'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    // Validate the username format
    const validatedUsername = usernameSchema.parse(username)

    // Check if username is available
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedUsername }
    })

    const isAvailable = !existingUser

    return NextResponse.json({
      available: isAvailable,
      username: validatedUsername
    })
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json({
      available: false,
      error: 'Invalid username format'
    }, { status: 400 })
  }
}