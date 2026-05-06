import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveTradesForUserAction } from '@/server/trades'
import { verifySecureToken } from '@/lib/api-auth'
import { apiError } from '@/lib/api-response'
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { parseJson } from '@/app/api/_utils/validate'
import { logger } from '@/lib/logger'

const MAX_MT5_BODY_BYTES = 3 * 1024 * 1024
const MAX_MT5_TRADES = 5_000

const mt5WriteRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'mt5-store-write' })
const mt5ReadRateLimit = rateLimit({ limit: 120, window: 60_000, identifier: 'mt5-store-read' })

const mt5PositionSchema = z.object({
  ticket: z.number(),
  symbol: z.string(),
  volume: z.number(),
  type: z.string(),
  price: z.number(),
  profit: z.number(),
  commission: z.number().optional().default(0),
  swap: z.number().optional().default(0),
  open_time: z.string(),
  close_time: z.string().optional(),
  magic: z.number().optional(),
  comment: z.string().optional(),
})

const mt5DealSchema = z.object({
  ticket: z.number(),
  position_id: z.number(),
  symbol: z.string(),
  volume: z.number(),
  price: z.number(),
  profit: z.number().optional().default(0),
  commission: z.number().optional().default(0),
  fee: z.number().optional().default(0),
  swap: z.number().optional().default(0),
  type: z.string(),
  entry: z.string(),
  time: z.string(),
  magic: z.number().optional(),
  comment: z.string().optional(),
})

const mt5TradeSchema = z.object({
  account_login: z.number(),
  account_server: z.string(),
  positions: z.array(mt5PositionSchema).optional(),
  deals: z.array(mt5DealSchema).optional(),
})

async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: { status: 401 } }
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const user = await verifySecureToken(token, 'mt5')
    
    if (!user) {
      return { authenticated: false, error: { status: 401 } }
    }
    
    return { authenticated: true, user }
  } catch {
    return { authenticated: false, error: { status: 401 } }
  }
}

function transformMT5PositionToTrade(position: z.infer<typeof mt5PositionSchema>, accountNumber: string) {
  const entryTime = new Date(position.open_time)
  const closeTime = position.close_time ? new Date(position.close_time) : new Date()
  const timeInPosition = Math.round((closeTime.getTime() - entryTime.getTime()) / 1000)
  
  return {
    accountNumber,
    instrument: position.symbol.replace(/[:#].*$/, ''),
    side: position.type === 'POSITION_TYPE_BUY' ? 'Long' : 'Short',
    quantity: Math.abs(position.volume).toString(),
    entryPrice: position.price.toString(),
    closePrice: position.price.toString(),
    pnl: position.profit.toString(),
    commission: (position.commission || 0).toString(),
    entryDate: entryTime.toISOString(),
    closeDate: closeTime.toISOString(),
    timeInPosition: timeInPosition.toString(),
    entryId: position.ticket.toString(),
    closeId: position.close_time ? position.ticket.toString() : null,
    comment: position.comment || null,
    tags: [],
    groupId: null,
  }
}

function transformMT5DealToTrade(deal: z.infer<typeof mt5DealSchema>, accountNumber: string) {
  const entryTime = new Date(deal.time)
  const isEntry = deal.entry === 'DEAL_ENTRY_IN'
  
  return {
    accountNumber,
    instrument: deal.symbol.replace(/[:#].*$/, ''),
    side: deal.type === 'DEAL_TYPE_BUY' ? 'Long' : 'Short',
    quantity: Math.abs(deal.volume).toString(),
    entryPrice: deal.price.toString(),
    closePrice: deal.price.toString(),
    pnl: (deal.profit || 0).toString(),
    commission: (deal.commission || 0).toString(),
    entryDate: entryTime.toISOString(),
    closeDate: entryTime.toISOString(),
    timeInPosition: '0',
    entryId: isEntry ? deal.ticket.toString() : null,
    closeId: !isEntry ? deal.ticket.toString() : null,
    comment: deal.comment || null,
    tags: [],
    groupId: null,
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const limit = await mt5WriteRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_MT5_BODY_BYTES) {
      return apiError('PAYLOAD_TOO_LARGE', 'Request payload is too large', 413, { requestId })
    }

    const auth = await authenticateRequest(req)

    if (!auth.authenticated) {
      return apiError('UNAUTHORIZED', 'Unauthorized', auth.error?.status || 401, { requestId })
    }

    const user = auth.user!
    const data = await parseJson(req, mt5TradeSchema)

    const trades: unknown[] = []
    const accountNumber = `${data.account_login}-${data.account_server}`

    if (data.positions && data.positions.length > 0) {
      for (const position of data.positions) {
        trades.push(transformMT5PositionToTrade(position, accountNumber))
      }
    }

    if (data.deals && data.deals.length > 0) {
      const closedTrades = data.deals
        .filter(deal => deal.entry === 'DEAL_ENTRY_OUT')
        .map(deal => transformMT5DealToTrade(deal, accountNumber))
      trades.push(...closedTrades)
    }

    if (trades.length === 0) {
      return apiError('VALIDATION_FAILED', 'No positions or deals provided', 400)
    }

    if (trades.length > MAX_MT5_TRADES) {
      return apiError('PAYLOAD_TOO_LARGE', `Too many trades. Maximum is ${MAX_MT5_TRADES}.`, 413)
    }
    
    const result = await saveTradesForUserAction(trades as never[], user.id)

    if (result.error && result.error !== 'DUPLICATE_TRADES') {
      return apiError('BAD_REQUEST', result.error, 400, result.details)
    }

    const mt5Account = await prisma.mT5Account.findFirst({
      where: {
        userId: user.id,
        login: BigInt(data.account_login),
        server: data.account_server,
      }
    })

    if (mt5Account) {
      await prisma.mT5Account.update({
        where: { id: mt5Account.id },
        data: {
          lastSyncAt: new Date(),
          lastTradeCount: trades.length,
          status: 'ACTIVE',
          lastSyncError: null,
        }
      })
    }

    return NextResponse.json({
      success: true,
      tradesAdded: result.numberOfTradesAdded,
    })

  } catch (error) {
    logger.error('[mt5/store] Error processing request:', { error })
    return apiError('INTERNAL_ERROR', 'Internal server error', 500, { requestId })
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    const limitResult = await mt5ReadRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const auth = await authenticateRequest(req)
    
    if (!auth.authenticated) {
      return apiError('UNAUTHORIZED', 'Unauthorized', auth.error?.status || 401)
    }
    
    const user = auth.user!
    const { searchParams } = new URL(req.url)
    const accountLogin = searchParams.get('login')
    const accountServer = searchParams.get('server')
    
    const where: { userId: string; login?: bigint; server?: string } = {
      userId: user.id,
    }
    
    if (accountLogin) {
      where.login = BigInt(accountLogin)
    }
    if (accountServer) {
      where.server = accountServer
    }
    
    const accounts = await prisma.mT5Account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ 
      success: true, 
      data: accounts.map((acc: { id: string; login: bigint; server: string; status: string; lastSyncAt: Date | null; lastTradeCount: number; isActive: boolean; lastActivityAt: Date | null; createdAt: Date }) => ({
        id: acc.id,
        login: acc.login.toString(),
        server: acc.server,
        status: acc.status,
        lastSyncAt: acc.lastSyncAt,
        lastTradeCount: acc.lastTradeCount,
        isActive: acc.isActive,
        lastActivityAt: acc.lastActivityAt,
        createdAt: acc.createdAt,
      }))
    })
    
  } catch (error) {
    logger.error('[mt5/store] Error retrieving accounts:', { error })
    return apiError('INTERNAL_ERROR', 'Failed to retrieve accounts', 500, { requestId })
  }
}
