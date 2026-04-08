'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { UnifiedFirm } from '@/server/deals'
import SearchHero from './SearchHero'
import FilterChips from './FilterChips'
import FirmCardsGrid from './FirmCardsGrid'
import type { FilterState } from './prop-firm-utils'

interface PropFirmsExplorerProps {
  locale: string
  firms?: UnifiedFirm[]
}

function matchesChallengeType(firm: UnifiedFirm, challengeType: string): boolean {
  if (challengeType === 'All') return true
  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((size) => !size.evaluation)
  const hasSinglePhase = sizes.some(
    (size) => size.evaluation && typeof size.name === 'string' && size.name.toLowerCase().includes('1-step')
  ) || sizes.some((size) => size.evaluation && size.profitSharing >= 90)

  if (challengeType === 'Instant') return hasInstant
  if (challengeType === 'One-phase') return hasSinglePhase && !hasInstant
  if (challengeType === 'Two-phase') return !hasSinglePhase && !hasInstant
  return true
}

function matchesSearch(firm: UnifiedFirm, query: string): boolean {
  if (!query) return true
  const normalized = query.toLowerCase()
  return (
    firm.name.toLowerCase().includes(normalized) ||
    firm.platform.toLowerCase().includes(normalized) ||
    firm.payoutModel.toLowerCase().includes(normalized) ||
    firm.drawdownType.toLowerCase().includes(normalized)
  )
}

function matchesDrawdown(firm: UnifiedFirm, drawdown: string): boolean {
  if (drawdown === 'All') return true
  if (drawdown === 'Static') return firm.drawdownType === 'Static'
  if (drawdown === 'Trailing') return firm.drawdownType === 'Trailing'
  if (drawdown === 'EOD') return firm.drawdownType === 'End-of-day'
  return true
}

export default function PropFirmsExplorer({ locale, firms }: PropFirmsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredQuery = useDeferredValue(searchQuery)
  const [filters, setFilters] = useState<FilterState>({
    platform: 'All',
    challengeType: 'All',
    drawdown: 'All',
  })

  const filteredFirms = useMemo(() => {
    const next = (firms ?? []).filter((firm) => {
      if (!matchesSearch(firm, deferredQuery)) return false
      if (filters.platform !== 'All' && firm.platform !== filters.platform) return false
      if (!matchesChallengeType(firm, filters.challengeType)) return false
      if (!matchesDrawdown(firm, filters.drawdown)) return false
      return true
    })

    return next.sort((a, b) => {
      if (b.catalogueStats.accountsCount !== a.catalogueStats.accountsCount) {
        return b.catalogueStats.accountsCount - a.catalogueStats.accountsCount
      }
      return b.catalogueStats.paidPayoutAmount - a.catalogueStats.paidPayoutAmount
    })
  }, [deferredQuery, filters, firms])

  return (
    <section className="rounded-3xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4 sm:p-6 lg:p-8">
      <SearchHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={(firms ?? []).length}
        filteredCount={filteredFirms.length}
      />

      <FilterChips
        filters={filters}
        onFilterChange={setFilters}
        totalCount={(firms ?? []).length}
        filteredCount={filteredFirms.length}
      />

      <FirmCardsGrid firms={filteredFirms} locale={locale} />

      <div className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Need the full board?</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Open the complete firm catalogue.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Switch to the dedicated catalogue view for payout analytics, timeframe breakdowns, and the full prop-firm board.
            </p>
          </div>
          <Link
            href={`/${locale}/propfirms`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-card)]"
          >
            Open catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
