'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchHeroProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalCount: number
  filteredCount: number
}

export default function SearchHero({ searchQuery, onSearchChange, totalCount, filteredCount }: SearchHeroProps) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-28 lg:px-8 lg:pt-32">

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-8%,hsl(var(--foreground)/0.08)_0%,transparent_58%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">

        <h1 className="text-center text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground [font-family:var(--home-display)]">
          Find Your Perfect
          <span className="block text-foreground">Prop Trading Firm</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base [font-family:var(--home-copy)]">
          Compare profit splits, drawdown rules, and payout policies across {totalCount} prop firms.
          {filteredCount < totalCount && (
            <span className="ml-1 text-foreground/80">
              Showing {filteredCount} matching firms.
            </span>
          )}
        </p>


        <div className="mx-auto mt-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search firms by name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 rounded-xl border-border/70 bg-card/80 pl-11 pr-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-ring/30 [font-family:var(--home-copy)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
