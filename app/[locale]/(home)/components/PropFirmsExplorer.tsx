'use client'

import { useState, useMemo } from 'react'
import { propFirms, type PropFirm } from '@/app/[locale]/dashboard/components/accounts/config'
import SearchHero from './SearchHero'
import FilterChips, { type FilterState } from './FilterChips'
import FirmCardsGrid from './FirmCardsGrid'

interface PropFirmsExplorerProps {
  locale: string
}

const platformMap: Record<string, string[]> = {
  Tradovate: ['earn2trade', 'apex', 'topstep', 'myFundedFutures'],
  Rithmic: ['bulenox', 'phidias', 'takeProfitTrader', 'tradeify', 'lucidTrading'],
  'MetaTrader 5': ['bulenox', 'phidias'],
  cTrader: ['bulenox'],
  DXtrade: ['topstep', 'myFundedFutures'],
}

function matchesPlatform(key: string, platform: string): boolean {
  if (platform === 'All') return true
  return platformMap[platform]?.includes(key) ?? false
}

function matchesChallengeType(firm: PropFirm, challengeType: string): boolean {
  if (challengeType === 'All') return true
  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((s) => !s.evaluation)
  const hasSinglePhase = sizes.some(
    (s) => s.evaluation && typeof s.minDays === 'number' && s.minDays <= 10
  )
  if (challengeType === 'Instant') return hasInstant
  if (challengeType === 'One-phase') return hasSinglePhase && !hasInstant
  if (challengeType === 'Two-phase') return !hasSinglePhase && !hasInstant
  return true
}

function matchesDrawdown(firm: PropFirm, drawdown: string): boolean {
  if (drawdown === 'All') return true
  const sizes = Object.values(firm.accountSizes)
  const trailingTypes = sizes.map((s) => s.trailing).filter(Boolean)
  if (drawdown === 'Static') return trailingTypes.some((t) => t === 'Static')
  if (drawdown === 'Trailing') return trailingTypes.some((t) => t === 'Intraday' || t === 'EOD')
  if (drawdown === 'EOD') return trailingTypes.some((t) => t === 'EOD')
  return true
}

function matchesSearch(name: string, query: string): boolean {
  if (!query) return true
  return name.toLowerCase().includes(query.toLowerCase())
}

function filterFirms(
  entries: Array<[string, PropFirm]>,
  searchQuery: string,
  filters: FilterState
): Array<[string, PropFirm]> {
  return entries.filter(([key, firm]) => {
    if (!matchesSearch(firm.name, searchQuery)) return false
    if (!matchesPlatform(key, filters.platform)) return false
    if (!matchesChallengeType(firm, filters.challengeType)) return false
    if (!matchesDrawdown(firm, filters.drawdown)) return false
    return true
  })
}

export default function PropFirmsExplorer({ locale }: PropFirmsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    platform: 'All',
    challengeType: 'All',
    drawdown: 'All',
  })

  const totalCount = useMemo(() => Object.keys(propFirms).length, [])
  const firmEntries = useMemo(() => Object.entries(propFirms), [])

  const filteredCount = useMemo(
    () => filterFirms(firmEntries, searchQuery, filters).length,
    [firmEntries, searchQuery, filters]
  )

  return (
    <>
      <SearchHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
      <FilterChips filters={filters} onFilterChange={setFilters} />
      <FirmCardsGrid searchQuery={searchQuery} filters={filters} locale={locale} />
    </>
  )
}
