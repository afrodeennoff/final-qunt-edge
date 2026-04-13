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
 <section className="overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-[oklch(0.035_0.005_264)] py-24 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_28px_70px_-44px_rgba(0,0,0,0.96)] sm:p-6 lg:p-8">
 <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
 <SearchHero
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 totalCount={(firms ?? []).length}
 filteredCount={filteredFirms.length}
 />

 <div className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05)]">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Explorer brief</p>
 <h3 className="mt-4 text-[1.35rem] font-[350] tracking-[-0.04em] text-foreground/95">
 Shortlist firms before you burn time on deeper review.
 </h3>
 <p className="mt-4 text-sm leading-[1.75] text-foreground/60">
 Start with platform fit, challenge shape, and drawdown model, then move into the full catalogue when you need payout depth and broader comparisons.
 </p>
 </div>
 <div className="mt-6 space-y-3">
 <div className="rounded-[1.4rem] border border-white/[0.08] bg-[oklch(0.65_0.22_260/0.045)] px-4 py-3">
 <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/34">Live view</p>
 <p className="mt-1 text-sm text-foreground/64">{filteredFirms.length} firms in the current shortlist</p>
 </div>
 <Link
 href={`/${locale}/propfirms`}
 className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all duration-200 hover:scale-[1.01] hover:bg-white/92"
 >
 Open full catalogue
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

 <div className="pt-8">
 <div className="flex flex-col gap-4 rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Need the full board?</p>
 <h2 className="mt-3 text-[1.5rem] font-[350] tracking-[-0.04em] text-foreground/95">
 Open the complete firm catalogue.
 </h2>
 <p className="mt-3 max-w-2xl text-sm leading-[1.75] text-foreground/60">
 Switch to the dedicated catalogue view for payout analytics, timeframe breakdowns, and the full prop-firm board.
 </p>
 </div>
 <Link
 href={`/${locale}/propfirms`}
 className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[oklch(0.65_0.22_260/0.06)] px-5 py-3 text-sm font-medium text-foreground/95 transition-colors hover:border-white/[0.18] hover:bg-white/[0.08]"
 >
 Explore all firms
 <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </section>
 )
}
