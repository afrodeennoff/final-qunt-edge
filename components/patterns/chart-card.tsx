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
      className={cn('rounded-2xl p-6 bg-card border border-border/10', className)}
      data-slot="chart-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-black text-foreground">
          {title}
        </h3>
        <div className="flex gap-1 bg-muted p-1 rounded-full">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors',
                activePeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2">{children}</div>

      {stats && stats.length > 0 && (
        <div className="border-t border-border pt-5 mt-6 grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-[16px] font-bold text-foreground">
                {stat.value}
                {stat.unit && <span className="text-muted-foreground text-[14px]">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}