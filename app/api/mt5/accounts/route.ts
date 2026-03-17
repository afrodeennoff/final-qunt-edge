import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'
import { generateSecureToken, revokeSecureToken } from '@/lib/api-auth'
import { encryptToken } from '@/lib/security/token-crypto'
import { apiError } from '@/lib/api-response'
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { parseJson } from '@/app/api/_utils/validate'

const mt5AccountRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: 'mt5-account-write' })

const addMT5AccountSchema = z.object({
  login: z.number().min(1, 'Login is required'),
  server: z.string().min(1, 'Server is required'),
  password: z.string().min(1, 'Investor password is required'),
  accountName: z.string().optional(),
})

const updateMT5AccountSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'ERROR']).optional(),
  accountName: z.string().optional(),
})

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  try {
    return await getDatabaseUserId()
  } catch {
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const { verifySecureToken } = await import('@/lib/api-auth')
      const token = authHeader.split(' ')[1]
      const user = await verifySecureToken(token, 'mt5')
      return user?.id || null
    }
    return null
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const limit = await mt5AccountRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const data = await parseJson(req, addMT5AccountSchema)

    const existingAccount = await prisma.mT5Account.findFirst({
      where: {
        userId,
        login: BigInt(data.login),
        server: data.server,
      }
    })

    if (existingAccount) {
      return apiError('CONFLICT', 'MT5 account already exists', 409)
    }

    const encryptedPassword = encryptToken(data.password)

    const mt5Account = await prisma.mT5Account.create({
      data: {
        userId,
        login: BigInt(data.login),
        server: data.server,
        passwordCiphertext: encryptedPassword.tokenCiphertext,
        passwordIv: encryptedPassword.tokenIv,
        passwordTag: encryptedPassword.tokenTag,
        passwordKeyVersion: encryptedPassword.tokenKeyVersion,
        accountName: data.accountName || `MT5 ${data.login}`,
        status: 'PENDING',
      }
    })

    const accessToken = await generateSecureToken(userId, 'mt5')

    return NextResponse.json({
      success: true,
      data: {
        id: mt5Account.id,
        login: mt5Account.login.toString(),
        server: mt5Account.server,
        accountName: mt5Account.accountName,
        status: mt5Account.status,
        createdAt: mt5Account.createdAt,
      },
      accessToken,
    })

  } catch (error) {
    console.error('[mt5/accounts] Error adding account:', error)
    return apiError('INTERNAL_ERROR', 'Failed to add MT5 account', 500, { requestId })
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(req.url)
    const includeCredentials = searchParams.get('include_credentials') === 'true'

    const accounts = await prisma.mT5Account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const responseData = accounts.map(acc => {
      const base = {
        id: acc.id,
        login: acc.login.toString(),
        server: acc.server,
        accountName: acc.accountName,
        status: acc.status,
        lastSyncAt: acc.lastSyncAt,
        lastTradeCount: acc.lastTradeCount,
        isActive: acc.isActive,
        lastActivityAt: acc.lastActivityAt,
        lastSyncError: acc.lastSyncError,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      }
      
      if (includeCredentials) {
        return {
          ...base,
          hasPassword: !!acc.passwordCiphertext,
        }
      }
      
      return base
    })

    return NextResponse.json({
      success: true,
      data: responseData,
    })

  } catch (error) {
    console.error('[mt5/accounts] Error retrieving accounts:', error)
    return apiError('INTERNAL_ERROR', 'Failed to retrieve accounts', 500, { requestId })
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const limit = await mt5AccountRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return apiError('VALIDATION_FAILED', 'Account ID is required', 400)
    }

    const existingAccount = await prisma.mT5Account.findFirst({
      where: {
        id: accountId,
        userId,
      }
    })

    if (!existingAccount) {
      return apiError('NOT_FOUND', 'MT5 account not found', 404)
    }

    const data = await parseJson(req, updateMT5AccountSchema)

    const updatedAccount = await prisma.mT5Account.update({
      where: { id: accountId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.accountName && { accountName: data.accountName }),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAccount.id,
        login: updatedAccount.login.toString(),
        server: updatedAccount.server,
        accountName: updatedAccount.accountName,
        status: updatedAccount.status,
        updatedAt: updatedAccount.updatedAt,
      },
    })

  } catch (error) {
    console.error('[mt5/accounts] Error updating account:', error)
    return apiError('INTERNAL_ERROR', 'Failed to update MT5 account', 500, { requestId })
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const limit = await mt5AccountRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const userId = await getAuthenticatedUserId(req)
    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return apiError('VALIDATION_FAILED', 'Account ID is required', 400)
    }

    const existingAccount = await prisma.mT5Account.findFirst({
      where: {
        id: accountId,
        userId,
      }
    })

    if (!existingAccount) {
      return apiError('NOT_FOUND', 'MT5 account not found', 404)
    }

    await prisma.mT5Account.delete({
      where: { id: accountId }
    })

    await revokeSecureToken(userId, 'mt5')

    return NextResponse.json({
      success: true,
      message: 'MT5 account deleted successfully',
    })

  } catch (error) {
    console.error('[mt5/accounts] Error deleting account:', error)
    return apiError('INTERNAL_ERROR', 'Failed to delete MT5 account', 500, { requestId })
  }
}
