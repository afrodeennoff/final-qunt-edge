import { NextRequest, NextResponse } from 'next/server'
import { connection } from 'next/server'
import { getActiveDeals, type DealFilters } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from './_auth'
import { apiError } from '@/lib/api-response'
import { withRateLimited } from '@/lib/api/with-api-route'
import { z } from 'zod'

const VALID_SORT_FIELDS = ['discountPercent', 'challengeFee', 'firmName', 'payoutModel', 'drawdownType', 'category', 'platform'] as const
type SortField = (typeof VALID_SORT_FIELDS)[number]
const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0

const dealsQuerySchema = z.object({
  search: z.string().optional(),
  market: z.enum(['Futures', 'Forex', 'Crypto']).optional(),
  platform: z.enum(['Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']).optional(),
  payoutModel: z.enum(['Bi-weekly', 'Weekly', 'On-demand', 'Monthly']).optional(),
  drawdownType: z.enum(['Trailing', 'Static', 'End-of-day']).optional(),
  minFee: z.coerce.number().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  sortBy: z.enum(VALID_SORT_FIELDS).default('discountPercent'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(200).default(DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).default(DEFAULT_OFFSET),
})

function isPrerenderInterruption(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const digest = 'digest' in error ? String((error as { digest?: unknown }).digest ?? '') : ''
  return digest === 'HANGING_PROMISE_REJECTION' || digest === 'NEXT_PRERENDER_INTERRUPTED'
}

function getSearchParams(request: NextRequest): URLSearchParams {
  const nextUrl = (request as NextRequest & { nextUrl?: URL }).nextUrl
  if (nextUrl?.searchParams) return nextUrl.searchParams
  return new URL(request.url).searchParams
}

async function handleGet(request: NextRequest) {
  await connection()
  try {
    const access = await requireDealsApiAuth(request)
    if (!access.ok) {
      return access.response
    }

    const searchParams = getSearchParams(request)
    let params: z.infer<typeof dealsQuerySchema>
    try {
      params = dealsQuerySchema.parse(Object.fromEntries(searchParams.entries()))
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return apiError('VALIDATION_FAILED', 'Invalid query parameters', 400, {
          issues: validationError.issues,
        })
      }
      throw validationError
    }
    const { search, market, platform, payoutModel, drawdownType, minFee, maxFee, sortBy, sortOrder, limit, offset } = params
    
    const dealFilters: DealFilters = {}
    if (search) dealFilters.search = search
    if (market) dealFilters.market = market
    if (platform) dealFilters.platform = platform
    if (sortBy) {
      dealFilters.sortBy = sortBy
      dealFilters.sortOrder = sortOrder
    }
    
    // Get deals with filters pushed to Prisma
    const allDeals = await getActiveDeals(
      search || market || platform ? dealFilters : undefined
    )
    
    // Apply remaining filters (payoutModel, drawdownType, minFee, maxFee) in JS
    let filteredDeals = allDeals
    if (payoutModel || drawdownType || minFee !== undefined || maxFee !== undefined) {
      filteredDeals = allDeals.filter(deal => {
        if (payoutModel && deal.payoutModel !== payoutModel) return false
        if (drawdownType && deal.drawdownType !== drawdownType) return false
        if (minFee !== undefined && deal.challengeFee < minFee) return false
        if (maxFee !== undefined && deal.challengeFee > maxFee) return false
        return true
      })
    }
    
    // Sort remaining filters that Prisma can't handle
    if (sortBy && !['discountPercent', 'challengeFee'].includes(sortBy)) {
      filteredDeals.sort((a, b) => {
        const key = sortBy as keyof typeof a
        const valueA = a[key]
        const valueB = b[key]
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA)
        }
        
        let numA: number = Number(valueA)
        let numB: number = Number(valueB)
        if (Number.isNaN(numA)) numA = 0
        if (Number.isNaN(numB)) numB = 0
        return sortOrder === 'asc' ? numA - numB : numB - numA
      })
    }
    
    // Apply pagination
    const paginatedDeals = filteredDeals.slice(offset, offset + limit)
    
    const dealsRes = NextResponse.json({
      deals: paginatedDeals,
      pagination: {
        total: filteredDeals.length,
        limit,
        offset,
        hasMore: offset + limit < filteredDeals.length
      }
    })
    dealsRes.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    return dealsRes
  } catch (error) {
    if (isPrerenderInterruption(error)) {
      return NextResponse.json({
        deals: [],
        pagination: {
          total: 0,
          limit: DEFAULT_LIMIT,
          offset: DEFAULT_OFFSET,
          hasMore: false,
        },
      })
    }

    logger.error('[api/deals] Error fetching active deals:', error)
    return apiError('INTERNAL_ERROR', 'Failed to fetch deals', 500)
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'deals-read',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'deals-list',
})
