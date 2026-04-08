import { cn } from './utils'
import React from 'react'

interface ChartCardProps {
  title: string
  periods: string[]
  activePeriod: string
  onPeriodChange: (period: string) => void
  stats?: {
    label: string
    value: string
    unit?: string
  }[]
  children: React.ReactNode
  className?: string
}

export function ChartCard({
  title,
  periods,
  activePeriod,
  onPeriodChange,
  stats,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 bg-card shadow-card', className)}
      data-slot="chart-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-semibold text-text-primary">
          {title}
        </h3>
        <div className="flex gap-1 bg-surface-muted p-1 rounded-full">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors',
                activePeriod === period
                  ? 'bg-primary text-white'
                  : 'text-text-disabled hover:text-text-secondary'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2">{children}</div>

      {stats && stats.length > 0 && (
        <div className="border-t border-surface-muted pt-5 mt-6 grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-[12px] text-text-tertiary mb-1">{stat.label}</p>
              <p className="text-[16px] font-bold text-text-primary">
                {stat.value}
                {stat.unit && <span className="text-text-secondary text-[14px]">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}