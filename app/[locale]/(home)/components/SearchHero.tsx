'use client'

import { Search } from 'lucide-react'

interface SearchHeroProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalCount: number
  filteredCount: number
}

export default function SearchHero({ searchQuery, onSearchChange, totalCount, filteredCount }: SearchHeroProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Prop Firms Explorer
        </p>
        <span className="rounded-full border border-border/0.04 bg-muted/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {filteredCount}/{totalCount}
        </span>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Find Your Perfect Prop Firm
      </h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prop firms..."
          className="h-10 w-full rounded-lg border border-border/0.04 bg-background/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>
    </div>
  )
}
