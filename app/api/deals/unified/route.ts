import { withRateLimited } from '@/lib/api/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { connection } from 'next/server'
import { getUnifiedFirms, type UnifiedFirm } from '@/server/deals'
import { logger } from '@/lib/logger'
import { requireDealsApiAuth } from '../_auth'

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

async function handleGet(request: NextRequest) {
  await connection()
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
    const minAccounts = searchParams.get('minAccounts') ? parseInt(searchParams.get('minAccounts')!) : null
    const maxAccounts = searchParams.get('maxAccounts') ? parseInt(searchParams.get('maxAccounts')!) : null
    const minPaidPayout = searchParams.get('minPaidPayout') ? parseFloat(searchParams.get('minPaidPayout')!) : null
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : DEFAULT_LIMIT
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : DEFAULT_OFFSET
    
    // Get all unified firms
    const allFirms = await getUnifiedFirms()
    
    // Apply filters
    const filteredFirms = allFirms.filter(firm => {
      // Search filter
      if (search && 
          !firm.name.toLowerCase().includes(search.toLowerCase()) && 
          !(firm.shortDesc ?? '').toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      
      // Market filter
      if (market && firm.category !== market) {
        return false
      }
      
      // Platform filter
      if (platform && firm.platform !== platform) {
        return false
      }
      
      // Payout model filter
      if (payoutModel && firm.payoutModel !== payoutModel) {
        return false
      }
      
      // Drawdown type filter
      if (drawdownType && firm.drawdownType !== drawdownType) {
        return false
      }
      
      // Accounts count filter
      if (minAccounts !== null && firm.catalogueStats.accountsCount < minAccounts) {
        return false
      }
      
      if (maxAccounts !== null && firm.catalogueStats.accountsCount > maxAccounts) {
        return false
      }
      
      // Paid payout amount filter
      if (minPaidPayout !== null && firm.catalogueStats.paidPayoutAmount < minPaidPayout) {
        return false
      }
      
      return true
    })
    
    // Apply sorting
    filteredFirms.sort((a, b) => {
      // Safely access properties using type assertion
      const valueA = a[sortBy as keyof UnifiedFirm]
      const valueB = b[sortBy as keyof UnifiedFirm]
      
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
    const paginatedFirms = filteredFirms.slice(offset, offset + limit)
    
    const unifiedRes = NextResponse.json({
      firms: paginatedFirms,
      pagination: {
        total: filteredFirms.length,
        limit,
        offset,
        hasMore: offset + limit < filteredFirms.length
      }
    })
    unifiedRes.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    return unifiedRes
  } catch (error) {
    if (isPrerenderInterruption(error)) {
      return NextResponse.json({
        firms: [],
        pagination: {
          total: 0,
          limit: DEFAULT_LIMIT,
          offset: DEFAULT_OFFSET,
          hasMore: false,
        },
      })
    }

    logger.error('[api/deals/unified] Error fetching unified firms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firms' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'deals-unified',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'deals-unified',
})
