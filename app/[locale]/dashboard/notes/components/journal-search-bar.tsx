'use client'

import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { JournalFilters, JournalSortField } from '../lib/journal-types'

interface JournalSearchBarProps {
  filters: JournalFilters
  onFiltersChange: (partial: Partial<JournalFilters>) => void
  onToggleFilters: () => void
  showFilters: boolean
}

const SORT_OPTIONS: { value: JournalSortField; label: string }[] = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'pnl-desc', label: 'PnL (high to low)' },
  { value: 'pnl-asc', label: 'PnL (low to high)' },
]

export function JournalSearchBar({ filters, onFiltersChange, onToggleFilters, showFilters }: JournalSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <input
          value={filters.search}
          onChange={e => onFiltersChange({ search: e.target.value })}
          placeholder="Search notes, tags, instrument..."
          className="h-8 w-full rounded-lg border-0 bg-background/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onToggleFilters}
        className={`flex h-8 items-center gap-1.5 rounded-lg border-0 px-2.5 text-xs text-muted-foreground hover:text-foreground ${showFilters ? 'border-primary/30 bg-primary/5 text-primary' : 'bg-background/40'}`}
      >
        <SlidersHorizontal size={13} />
        Filters
      </button>

      <div className="relative flex h-8 items-center gap-1.5 rounded-lg border-0 bg-background/40 px-2.5 text-xs">
        <ArrowUpDown size={13} className="text-muted-foreground/50" />
        <select
          value={filters.sort}
          onChange={e => onFiltersChange({ sort: e.target.value as JournalSortField })}
          className="appearance-none bg-transparent text-xs text-foreground focus:outline-none"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
