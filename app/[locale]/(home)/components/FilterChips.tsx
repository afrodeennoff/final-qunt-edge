'use client'

import type { ReactNode } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

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

export default function FilterChips({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterChipsProps) {
  const t = useI18n()

  const platformOptions = [
    { value: 'All', label: t('landing.home.explorer.optionAll') },
    { value: 'Tradovate', label: t('landing.home.explorer.optionTradovate') },
    { value: 'Rithmic', label: t('landing.home.explorer.optionRithmic') },
    { value: 'MetaTrader 5', label: t('landing.home.explorer.optionMetaTrader5') },
    { value: 'cTrader', label: t('landing.home.explorer.optionCTrader') },
    { value: 'DXtrade', label: t('landing.home.explorer.optionDXtrade') },
  ]

  const challengeTypeOptions = [
    { value: 'All', label: t('landing.home.explorer.optionAll') },
    { value: 'One-phase', label: t('landing.home.explorer.optionOnePhase') },
    { value: 'Two-phase', label: t('landing.home.explorer.optionTwoPhase') },
    { value: 'Instant', label: t('landing.home.explorer.optionInstant') },
  ]

  const drawdownOptions = [
    { value: 'All', label: t('landing.home.explorer.optionAll') },
    { value: 'Static', label: t('landing.home.explorer.optionStatic') },
    { value: 'Trailing', label: t('landing.home.explorer.optionTrailing') },
    { value: 'EOD', label: t('landing.home.explorer.optionEod') },
  ]

  const hasActiveFilters =
    filters.platform !== 'All' || filters.challengeType !== 'All' || filters.drawdown !== 'All'

  return (
    <section className="py-5">
      <div className="rounded-lg border border-border/50 bg-card/80 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t('landing.home.explorer.refineBoard')}
              </div>
              <p className="mt-2 text-sm text-foreground/80">
                {filteredCount === totalCount
                  ? t('landing.home.explorer.firmsInView', { count: totalCount })
                  : t('landing.home.explorer.firmsMatch', {
                      count: filteredCount,
                      total: totalCount,
                    })}
              </p>
            </div>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onFilterChange({
                    platform: 'All',
                    challengeType: 'All',
                    drawdown: 'All',
                  })
                }
                className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                {t('landing.home.explorer.reset')}
              </Button>
            ) : null}
          </div>

          <ChipRow
            label={String(t('landing.home.explorer.platformLabel'))}
            options={platformOptions}
            selected={filters.platform}
            onSelect={(value) => onFilterChange({ ...filters, platform: value })}
          />
          <ChipRow
            label={String(t('landing.home.explorer.challengeLabel'))}
            options={challengeTypeOptions}
            selected={filters.challengeType}
            onSelect={(value) => onFilterChange({ ...filters, challengeType: value })}
          />
          <ChipRow
            label={String(t('landing.home.explorer.drawdownLabel'))}
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
  options: Array<{ value: string; label: ReactNode }>
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="grid gap-2 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
              selected === option.value
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-background/70 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
