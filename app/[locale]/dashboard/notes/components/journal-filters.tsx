'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JournalFilters, JournalPnlFilter, JournalStatus } from '../lib/journal-types'

interface JournalFiltersProps {
  filters: JournalFilters
  onChange: (partial: Partial<JournalFilters>) => void
  instruments: string[]
}

const STATUS_OPTIONS: { value: JournalStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'journaled', label: 'Journaled' },
  { value: 'not-journaled', label: 'Not journaled' },
]

const PNL_OPTIONS: { value: JournalPnlFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'winners', label: 'Winners' },
  { value: 'losers', label: 'Losers' },
  { value: 'breakeven', label: 'Breakeven' },
]

export function JournalFiltersPanel({ filters, onChange, instruments }: JournalFiltersProps) {
  const hasActive = filters.status !== 'all' || filters.pnl !== 'all' || filters.instrument !== null || filters.direction !== 'all' || filters.dateFrom !== null || filters.dateTo !== null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border-0 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ status: opt.value })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.status === opt.value
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/20" />

      <div className="flex items-center gap-1">
        {PNL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ pnl: opt.value })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.pnl === opt.value
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/20" />

      <div className="flex items-center gap-1">
        {(['all', 'LONG', 'SHORT'] as const).map(dir => (
          <button
            key={dir}
            type="button"
            onClick={() => onChange({ direction: dir })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.direction === dir
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {dir === 'all' ? 'Both' : dir}
          </button>
        ))}
      </div>

      {instruments.length > 0 && (
        <>
          <div className="h-4 w-px bg-border/20" />
          <select
            value={filters.instrument ?? ''}
            onChange={e => onChange({ instrument: e.target.value || null })}
            className="h-6 rounded-md border-0 bg-background/40 px-1.5 text-[11px] text-foreground"
          >
            <option value="">All instruments</option>
            {instruments.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </>
      )}

      <div className="h-4 w-px bg-border/20" />

      <input
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={e => onChange({ dateFrom: e.target.value || null })}
        className="h-6 rounded-md border-0 bg-background/40 px-1.5 text-[11px] text-foreground"
      />
      <span className="text-[11px] text-muted-foreground/50">to</span>
      <input
        type="date"
        value={filters.dateTo ?? ''}
        onChange={e => onChange({ dateTo: e.target.value || null })}
        className="h-6 rounded-md border-0 bg-background/40 px-1.5 text-[11px] text-foreground"
      />

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange({ status: 'all', pnl: 'all', instrument: null, direction: 'all', dateFrom: null, dateTo: null })}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  )
}
