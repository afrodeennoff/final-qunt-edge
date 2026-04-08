'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { cn } from '@/lib/utils'

export interface FilterState {
  platform: string
  challengeType: string
  drawdown: string
}

interface FilterChipsProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

const platformOptions = ['All', 'Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']
const challengeTypeOptions = ['All', 'One-phase', 'Two-phase', 'Instant']
const drawdownOptions = ['All', 'Static', 'Trailing', 'EOD']

export default function FilterChips({ filters, onFilterChange, totalCount, filteredCount }: FilterChipsProps) {
  const hasActiveFilters =
    filters.platform !== 'All' || filters.challengeType !== 'All' || filters.drawdown !== 'All'

  return (
    <section className="py-5">
      <div className="rounded-3xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Refine the board
              </div>
              <p className="mt-2 text-sm text-foreground/80">
                {filteredCount === totalCount ? `${totalCount} firms in view` : `${filteredCount} of ${totalCount} firms match`}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange({ platform: 'All', challengeType: 'All', drawdown: 'All' })}
                className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            ) : null}
          </div>

          <ChipRow
            label="Platform"
            options={platformOptions}
            selected={filters.platform}
            onSelect={(value) => onFilterChange({ ...filters, platform: value })}
          />
          <ChipRow
            label="Challenge"
            options={challengeTypeOptions}
            selected={filters.challengeType}
            onSelect={(value) => onFilterChange({ ...filters, challengeType: value })}
          />
          <ChipRow
            label="Drawdown"
            options={drawdownOptions}
            selected={filters.drawdown}
            onSelect={(value) => onFilterChange({ ...filters, drawdown: value })}
          />
        </div>
      </div>
    </section>
  )
}

function ChipRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: string[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="grid gap-2 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
              selected === option
                ? 'border border-[var(--frost-border-strong)] bg-[var(--text-primary)] text-[var(--surface-card)]'
                : 'border border-[var(--frost-border)] bg-[var(--surface-card)] text-muted-foreground hover:border-[var(--frost-border-strong)] hover:text-foreground'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
