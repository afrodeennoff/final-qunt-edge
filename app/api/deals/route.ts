import { NextResponse } from 'next/server'
import { getActiveDeals, type DealItem } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from './_auth'
import { apiError } from '@/lib/api-response'
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

function getSearchParams(request: Request): URLSearchParams {
  const nextUrl = (request as Request & { nextUrl?: URL }).nextUrl
  if (nextUrl?.searchParams) return nextUrl.searchParams
  return new URL(request.url).searchParams
}

export async function GET(request: Request) {
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
          issues: validationError.errors,
        })
      }
      throw validationError
    }
    const { search, market, platform, payoutModel, drawdownType, minFee, maxFee, sortBy, sortOrder, limit, offset } = params
    
    // Get all active deals
    const allDeals = await getActiveDeals()
    
    // Apply filters
    let filteredDeals = allDeals.filter(deal => {
      // Search filter
      if (search && !deal.firmName.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      
      // Market filter
      if (market && deal.category !== market) {
        return false
      }
      
      // Platform filter
      if (platform && deal.platform !== platform) {
        return false
      }
      
      // Payout model filter
      if (payoutModel && deal.payoutModel !== payoutModel) {
        return false
      }
      
      // Drawdown type filter
      if (drawdownType && deal.drawdownType !== drawdownType) {
        return false
      }
      
      // Fee range filter
      if (minFee !== undefined && deal.challengeFee < minFee) {
        return false
      }
      
      if (maxFee !== undefined && deal.challengeFee > maxFee) {
        return false
      }
      
      return true
    })
    
    // Apply sorting
    const sortKey = sortBy as keyof DealItem
    filteredDeals.sort((a, b) => {
      const valueA = a[sortKey]
      const valueB = b[sortKey]
      
      // Handle special sorting cases
      if (sortKey === 'challengeFee') {
        const feeA = (valueA as number) ?? 0
        const feeB = (valueB as number) ?? 0
        return sortOrder === 'asc' ? feeA - feeB : feeB - feeA
      }
      
      // String comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA)
      }
      
      // For all other types, convert to numbers for comparison
      let numA: number = Number(valueA)
      let numB: number = Number(valueB)
      
      // Handle NaN values
      if (Number.isNaN(numA)) {
        numA = 0
      }
      if (Number.isNaN(numB)) {
        numB = 0
      }
      
      return sortOrder === 'asc' ? numA - numB : numB - numA
    })
    
    // Apply pagination
    const paginatedDeals = filteredDeals.slice(offset, offset + limit)
    
    return NextResponse.json({
      deals: paginatedDeals,
      pagination: {
        total: filteredDeals.length,
        limit,
        offset,
        hasMore: offset + limit < filteredDeals.length
      }
    })
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
