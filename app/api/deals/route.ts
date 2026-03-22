import { NextResponse } from 'next/server'
import { getActiveDeals, type DealItem } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    
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
    logger.error('[api/deals] Error fetching active deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}