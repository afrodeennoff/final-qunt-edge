'use client'

import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import FirmCard from './FirmCard'
import type { FilterState } from './FilterChips'

interface FirmCardsGridProps {
  searchQuery: string
  filters: FilterState
  locale: string
}

function matchesSearch(firmName: string, query: string): boolean {
  if (!query) return true
  return firmName.toLowerCase().includes(query.toLowerCase())
}

function matchesPlatform(firmKey: string, platform: string): boolean {
  if (platform === 'All') return true
  const platformMap: Record<string, string[]> = {
    Tradovate: ['earn2trade', 'apex', 'topstep', 'myFundedFutures'],
    Rithmic: ['bulenox', 'phidias', 'takeProfitTrader', 'tradeify', 'lucidTrading'],
    'MetaTrader 5': ['bulenox', 'phidias'],
    cTrader: ['bulenox'],
    DXtrade: ['topstep', 'myFundedFutures'],
  }
  return platformMap[platform]?.includes(firmKey) ?? false
}

function matchesChallengeType(firmKey: string, challengeType: string): boolean {
  if (challengeType === 'All') return true
  const firm = propFirms[firmKey]
  if (!firm) return false

  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((s) => !s.evaluation)
  const hasSinglePhase = sizes.some(
    (s) => s.evaluation && typeof s.minDays === 'number' && s.minDays <= 10
  )

  switch (challengeType) {
    case 'Instant':
      return hasInstant
    case 'One-phase':
      return hasSinglePhase && !hasInstant
    case 'Two-phase':
      return !hasSinglePhase && !hasInstant
    default:
      return true
  }
}

function matchesDrawdown(firmKey: string, drawdown: string): boolean {
  if (drawdown === 'All') return true
  const firm = propFirms[firmKey]
  if (!firm) return false

  const sizes = Object.values(firm.accountSizes)
  const trailingTypes = sizes.map((s) => s.trailing).filter(Boolean)

  switch (drawdown) {
    case 'Static':
      return trailingTypes.some((t) => t === 'Static')
    case 'Trailing':
      return trailingTypes.some((t) => t === 'Intraday' || t === 'EOD')
    case 'EOD':
      return trailingTypes.some((t) => t === 'EOD')
    default:
      return true
  }
}

export default function FirmCardsGrid({ searchQuery, filters, locale }: FirmCardsGridProps) {
  const filteredFirms = Object.entries(propFirms).filter(([key, firm]) => {
    if (!matchesSearch(firm.name, searchQuery)) return false
    if (!matchesPlatform(key, filters.platform)) return false
    if (!matchesChallengeType(key, filters.challengeType)) return false
    if (!matchesDrawdown(key, filters.drawdown)) return false
    return true
  })

  if (filteredFirms.length === 0) {
    return (
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/30 py-16">
            <p className="text-sm font-medium text-muted-foreground [font-family:var(--home-copy)]">
              No firms match your filters
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60 [font-family:var(--home-copy)]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFirms.map(([key, firm]) => (
            <FirmCard key={key} firm={firm} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
