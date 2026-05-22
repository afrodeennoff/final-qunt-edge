'use client'

import { platformOptions, challengeTypeOptions, drawdownOptions } from './prop-firm-utils'
import type { FilterState } from './prop-firm-utils'

interface FilterChipsProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === option
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-muted/30 text-muted-foreground hover:bg-muted'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default function FilterChips({ filters, onFilterChange }: FilterChipsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-4">
      <ChipGroup
        label="Platform"
        options={platformOptions}
        value={filters.platform}
        onChange={(platform) => onFilterChange({ ...filters, platform })}
      />
      <ChipGroup
        label="Challenge Type"
        options={challengeTypeOptions}
        value={filters.challengeType}
        onChange={(challengeType) => onFilterChange({ ...filters, challengeType })}
      />
      <ChipGroup
        label="Drawdown"
        options={drawdownOptions}
        value={filters.drawdown}
        onChange={(drawdown) => onFilterChange({ ...filters, drawdown })}
      />
    </div>
  )
}
