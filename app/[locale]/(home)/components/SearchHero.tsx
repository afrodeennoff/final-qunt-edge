'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchHeroProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalCount: number
  filteredCount: number
}

export default function SearchHero({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: SearchHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--frost-border)] bg-[var(--surface-card)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_50%_0%,hsl(var(--foreground)/0.06),transparent_70%)]" />

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Explorer
        </div>
        <h2 className="mt-4 text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-foreground [font-family:var(--home-display)]">
          Compare firms with a cleaner first pass.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Filter by platform, challenge shape, and drawdown model to narrow the field before you commit more research time.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by firm, platform, or payout model..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-[52px] rounded-2xl border-border/70 bg-card/90 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <MetaCard label="Tracked" value={totalCount.toString()} />
          <MetaCard label="Matching" value={filteredCount.toString()} />
        </div>
      </div>
    </section>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
