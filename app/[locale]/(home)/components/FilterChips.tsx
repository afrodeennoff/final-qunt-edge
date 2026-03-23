'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FilterState {
  platform: string
  challengeType: string
  drawdown: string
}

interface FilterChipsProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const platformOptions = ['All', 'Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']
const challengeTypeOptions = ['All', 'One-phase', 'Two-phase', 'Instant']
const drawdownOptions = ['All', 'Static', 'Trailing', 'EOD']

function ChipGroup({
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
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground [font-family:var(--home-copy)]">
        {label}
      </span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors [font-family:var(--home-copy)]',
              selected === option
                ? 'border-foreground/20 bg-foreground/10 text-foreground'
                : 'border-border/60 bg-transparent text-muted-foreground hover:border-border hover:bg-foreground/5 hover:text-foreground'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FilterChips({ filters, onFilterChange }: FilterChipsProps) {
  const hasActiveFilters =
    filters.platform !== 'All' || filters.challengeType !== 'All' || filters.drawdown !== 'All'

  const clearAll = () => {
    onFilterChange({ platform: 'All', challengeType: 'All', drawdown: 'All' })
  }

  return (
    <section className="px-4 pb-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <ChipGroup
                label="Platform"
                options={platformOptions}
                selected={filters.platform}
                onSelect={(v) => onFilterChange({ ...filters, platform: v })}
              />
              <div className="hidden h-5 w-px bg-border/60 sm:block" />
              <ChipGroup
                label="Challenge"
                options={challengeTypeOptions}
                selected={filters.challengeType}
                onSelect={(v) => onFilterChange({ ...filters, challengeType: v })}
              />
              <div className="hidden h-5 w-px bg-border/60 sm:block" />
              <ChipGroup
                label="Drawdown"
                options={drawdownOptions}
                selected={filters.drawdown}
                onSelect={(v) => onFilterChange({ ...filters, drawdown: v })}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
