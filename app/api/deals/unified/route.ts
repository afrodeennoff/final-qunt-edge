import { NextResponse } from 'next/server'
import { getUnifiedFirms, type UnifiedFirm } from '@/server/deals'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    
    // Get all unified firms
    const allFirms = await getUnifiedFirms()
    
    // Apply filters
    let filteredFirms = allFirms.filter(firm => {
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
    
    return NextResponse.json({
      firms: paginatedFirms,
      pagination: {
        total: filteredFirms.length,
        limit,
        offset,
        hasMore: offset + limit < filteredFirms.length
      }
    })
  } catch (error) {
    logger.error('[api/deals/unified] Error fetching unified firms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch firms' },
      { status: 500 }
    )
  }
}