import { NextRequest } from 'next/server'
import { z } from 'zod/v3'
import { Prisma } from '@/prisma/generated/prisma'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'
import { JOURNAL_PAGE_SIZE } from '@/app/[locale]/dashboard/notes/lib/journal-constants'

const JournalSchema = z.object({
  tradeId: z.string().min(1),
  accountNumber: z.string().optional(),
  content: z.string().optional(),
  preTradeNotes: z.string().optional(),
  postTradeReview: z.string().optional(),
  emotions: z.string().optional(),
  confidenceRating: z.number().min(0).max(10).optional(),
  disciplineScore: z.number().min(0).max(10).optional(),
  customTags: z.array(z.string()).optional(),
  screenshots: z.array(z.string()).optional(),
  timeframe: z.string().optional(),
  session: z.string().optional(),
  excerptTitle: z.string().optional(),
  featuredExcerpt: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeWithDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) {
        return nested.toNumber()
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
    const accountNumber = searchParams.get('accountNumber') || undefined

    // Build where clause
    const where: Prisma.TradeWhereInput = {
      userId: dbUser.id,
    }
    if (accountNumber) where.accountNumber = accountNumber

    // Build journal filter incrementally so status + tags are AND-ed correctly.
    const journalFilter: Record<string, unknown> = {}
    if (status === 'journaled') {
      journalFilter.isNot = null
    } else if (status === 'not-journaled') {
      journalFilter.is = null
    }
    if (tags && tags.length > 0) {
      journalFilter.customTags = { hasEvery: tags }
    }
    if (Object.keys(journalFilter).length > 0) {
      if (journalFilter.isNot !== undefined) {
        const { isNot: _isNot, ...rest } = journalFilter
        where.journal = Object.keys(rest).length > 0 ? rest : { isNot: null }
      } else if (journalFilter.is !== undefined) {
        where.journal = { is: null }
      } else {
        where.journal = journalFilter
      }
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

    // Search filter
    if (search) {
      where.OR = [
        { instrument: { contains: search, mode: 'insensitive' } },
        { journal: { preTradeNotes: { contains: search, mode: 'insensitive' } } },
        { journal: { postTradeReview: { contains: search, mode: 'insensitive' } } },
        { journal: { emotions: { contains: search, mode: 'insensitive' } } },
        { journal: { customTags: { has: search } } },
        { journal: { excerptTitle: { contains: search, mode: 'insensitive' } } },
        { journal: { featuredExcerpt: { contains: search, mode: 'insensitive' } } },
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

    const body = JournalSchema.parse(await request.json())
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
      timeframe,
      session,
      excerptTitle,
      featuredExcerpt,
    } = body

    if (!accountNumber) {
      return apiError(
        'VALIDATION_FAILED',
        'accountNumber is required',
        400,
        { requestId },
      )
    }

    const entry = await prisma.$transaction(async (tx) => {
      const existing = await tx.journalEntry.findUnique({
        where: { tradeId },
      })
      if (existing) throw new Error('CONFLICT')

      const trade = await tx.trade.findFirst({
        where: { id: tradeId, userId: dbUser.id },
      })
      if (!trade) throw new Error('NOT_FOUND')

      return tx.journalEntry.create({
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
          timeframe: timeframe ?? null,
          session: session ?? null,
          excerptTitle: excerptTitle ?? null,
          featuredExcerpt: featuredExcerpt ?? null,
        },
      })
    }).catch((err) => {
      if (err instanceof Error && err.message === 'CONFLICT') {
        throw { code: 'CONFLICT', status: 409, message: 'Journal entry already exists for this trade' }
      }
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        throw { code: 'NOT_FOUND', status: 404, message: 'Trade not found' }
      }
      throw err
    })

    return apiSuccess(serializeWithDecimals(entry), 201)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const apiErr = error as { code: string; status: number; message: string }
      return apiError(apiErr.code as any, apiErr.message, apiErr.status, { requestId })
    }
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
