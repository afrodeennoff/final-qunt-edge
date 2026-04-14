'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/locales/client'

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
  const t = useI18n()

  return (
    <section className="relative isolate overflow-hidden rounded-lg border border-border/50 bg-card/80 px-5 py-6 shadow-sm sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]" />

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {t('landing.home.explorer.badge')}
        </div>
        <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.4rem)] font-[350] leading-[0.96] tracking-[-0.045em] text-foreground [font-family:var(--home-display)]">
          {t('landing.home.explorer.title')}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t('landing.home.explorer.description')}
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={String(t('landing.home.explorer.searchPlaceholder'))}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-12 rounded-md border-border/50 bg-background/70 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <MetaCard
            label={String(t('landing.home.explorer.tracked'))}
            value={totalCount.toString()}
          />
          <MetaCard
            label={String(t('landing.home.explorer.matching'))}
            value={filteredCount.toString()}
          />
        </div>
      </div>
    </section>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
