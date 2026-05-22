'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { UnifiedFirm } from '@/server/deals'
import { useI18n } from '@/locales/client'
import SearchHero from './SearchHero'
import FilterChips from './FilterChips'
import FirmCardsGrid from './FirmCardsGrid'
import type { FilterState } from './prop-firm-utils'
import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'

interface PropFirmsExplorerProps {
  locale: string
  firms?: UnifiedFirm[]
}

function matchesChallengeType(firm: UnifiedFirm, challengeType: string): boolean {
  if (challengeType === 'All') return true
  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((size) => !size.evaluation)
  const hasSinglePhase =
    sizes.some(
      (size) =>
        size.evaluation &&
        typeof size.name === 'string' &&
        size.name.toLowerCase().includes('1-step'),
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
  const t = useI18n()
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
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <Card variant="glass" className="p-6 md:p-6 lg:p-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
          <SearchHero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={(firms ?? []).length}
            filteredCount={filteredFirms.length}
          />

          <div className="flex h-full flex-col justify-between rounded-lg border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-6 shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.explorer.explorerBriefTitle')}
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {t('landing.home.explorer.explorerBriefHeading')}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.explorer.explorerBriefDescription')}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-md border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.04)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('landing.home.explorer.liveViewTitle')}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {t('landing.home.explorer.liveViewCount', {
                    count: filteredFirms.length,
                  })}
                </p>
              </div>
              <Link
                href={`/${locale}/propfirms`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110"
              >
                {t('landing.home.explorer.openFullCatalogue')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <FilterChips
          filters={filters}
          onFilterChange={setFilters}
          totalCount={(firms ?? []).length}
          filteredCount={filteredFirms.length}
        />

        <FirmCardsGrid firms={filteredFirms} locale={locale} />

        <div className="pt-6">
          <div className="flex flex-col gap-4 rounded-lg border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-6 shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] md:flex-row md:items-end md:justify-between md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.explorer.needFullBoardTitle')}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {t('landing.home.explorer.needFullBoardHeading')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.explorer.needFullBoardDescription')}
              </p>
            </div>
            <Link
              href={`/${locale}/propfirms`}
              className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.04)] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[oklch(0.65_0.22_260/0.06)]"
            >
              {t('landing.home.explorer.exploreAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
           </div>
         </div>
       </Card>
     </MarketingSection>
   )
 }
