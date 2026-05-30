import { NextRequest } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'
import { JOURNAL_PAGE_SIZE } from '@/app/[locale]/dashboard/notes/lib/journal-constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeWithDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) {
        return nested.toString()
      }
      if (nested instanceof Date) {
        return nested.toISOString()
      }
      return nested
    }),
  ) as T
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/journal — List trades with journal entries
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, { requestId })
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true },
    })
    if (!dbUser) {
      return apiError('UNAUTHORIZED', 'User not found', 401, { requestId })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = Math.min(
      Math.max(1, Number(searchParams.get('pageSize') ?? String(JOURNAL_PAGE_SIZE))),
      200,
    )
    const search = searchParams.get('search')?.trim() || undefined
    const status = searchParams.get('status') || undefined
    const sort = searchParams.get('sort') || 'date-desc'
    const instrument = searchParams.get('instrument') || undefined
    const direction = searchParams.get('direction') || undefined
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const tagsRaw = searchParams.get('tags') || undefined
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : undefined

    // Build where clause
    const where: Prisma.TradeWhereInput = {
      userId: dbUser.id,
    }

    // Status filter
    if (status === 'journaled') {
      where.journal = { isNot: null }
    } else if (status === 'not-journaled') {
      where.journal = { is: null }
    }

    // Instrument filter
    if (instrument) {
      where.instrument = instrument
    }

    // Direction filter
    if (direction) {
      where.side = direction
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.entryDate = {}
      if (dateFrom) {
        (where.entryDate as Prisma.DateTimeFilter).gte = new Date(dateFrom)
      }
      if (dateTo) {
        (where.entryDate as Prisma.DateTimeFilter).lte = new Date(dateTo)
      }
    }

    // Tags filter — journal must have all specified custom tags
    if (tags && tags.length > 0) {
      where.journal = {
        ...(where.journal as Prisma.JournalEntryNullableCompositeFilter | undefined || {}),
        customTags: { hasEvery: tags },
      }
    }

    // Search filter
    if (search) {
      const searchContains = `%${search}%`
      where.OR = [
        { instrument: { contains: search, mode: 'insensitive' } },
        { journal: { preTradeNotes: { contains: search, mode: 'insensitive' } } },
        { journal: { postTradeReview: { contains: search, mode: 'insensitive' } } },
        { journal: { emotions: { contains: search, mode: 'insensitive' } } },
        { journal: { customTags: { has: search } } },
      ]
    }

    // Sort order
    let orderBy: Prisma.TradeOrderByWithRelationInput
    switch (sort) {
      case 'date-asc':
        orderBy = { entryDate: 'asc' }
        break
      case 'pnl-desc':
        orderBy = { pnl: 'desc' }
        break
      case 'pnl-asc':
        orderBy = { pnl: 'asc' }
        break
      case 'date-desc':
      default:
        orderBy = { entryDate: 'desc' }
        break
    }

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        include: { journal: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trade.count({ where }),
    ])

    const entries = trades.map((trade) => ({
      trade: serializeWithDecimals(trade),
      journal: trade.journal ? serializeWithDecimals(trade.journal) : null,
    }))

    return apiSuccess({
      entries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to fetch journal entries', 500, { requestId })
  }
}

// ---------------------------------------------------------------------------
// POST /api/dashboard/journal — Create journal entry
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, { requestId })
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true },
    })
    if (!dbUser) {
      return apiError('UNAUTHORIZED', 'User not found', 401, { requestId })
    }

    const body = await request.json()
    const {
      tradeId,
      accountNumber,
      preTradeNotes,
      postTradeReview,
      emotions,
      confidenceRating,
      disciplineScore,
      customTags,
      screenshots,
    } = body

    if (!tradeId || !accountNumber) {
      return apiError(
        'VALIDATION_FAILED',
        'tradeId and accountNumber are required',
        400,
        { requestId },
      )
    }

    // Check for existing entry
    const existing = await prisma.journalEntry.findUnique({
      where: { tradeId },
    })
    if (existing) {
      return apiError('CONFLICT', 'Journal entry already exists for this trade', 409, { requestId })
    }

    // Verify trade belongs to user
    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId: dbUser.id },
    })
    if (!trade) {
      return apiError('NOT_FOUND', 'Trade not found', 404, { requestId })
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: dbUser.id,
        tradeId,
        accountNumber,
        preTradeNotes: preTradeNotes ?? null,
        postTradeReview: postTradeReview ?? null,
        emotions: emotions ?? null,
        confidenceRating: confidenceRating ?? null,
        disciplineScore: disciplineScore ?? null,
        customTags: customTags ?? [],
        screenshots: screenshots ?? [],
      },
    })

    return apiSuccess(serializeWithDecimals(entry), 201)
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to create journal entry', 500, { requestId })
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'journal-list',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'GET /api/dashboard/journal',
})

export const POST = withRateLimited(handlePost, {
  rateLimitId: 'journal-create',
  rateLimitMax: 60,
  rateLimitWindow: 60_000,
  routeName: 'POST /api/dashboard/journal',
})
