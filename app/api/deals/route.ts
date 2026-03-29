import { NextResponse } from 'next/server'
import { getActiveDeals, type DealItem } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from './_auth'

const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0

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
    
    // Extract query parameters
    const search = searchParams.get('search') || ''
    const market = searchParams.get('market') as 'Futures' | 'Forex' | 'Crypto' | null
    const platform = searchParams.get('platform') as 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade' | null
    const payoutModel = searchParams.get('payoutModel') as 'Bi-weekly' | 'Weekly' | 'On-demand' | 'Monthly' | null
    const drawdownType = searchParams.get('drawdownType') as 'Trailing' | 'Static' | 'End-of-day' | null
    const minFee = searchParams.get('minFee') ? parseFloat(searchParams.get('minFee')!) : null
    const maxFee = searchParams.get('maxFee') ? parseFloat(searchParams.get('maxFee')!) : null
    const sortBy = searchParams.get('sortBy') || 'discountPercent'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : DEFAULT_LIMIT
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : DEFAULT_OFFSET
    
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
      if (minFee !== null && deal.challengeFee < minFee) {
        return false
      }
      
      if (maxFee !== null && deal.challengeFee > maxFee) {
        return false
      }
      
      return true
    })
    
    // Apply sorting
    filteredDeals.sort((a, b) => {
      // Safely access properties using type assertion
      const valueA = a[sortBy as keyof DealItem]
      const valueB = b[sortBy as keyof DealItem]
      
      // Handle special sorting cases
      if (sortBy === 'challengeFee') {
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
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}
