import { cn } from './utils'
import React from 'react'

interface DonutChartCardProps {
  title: string
  centerValue: string
  centerUnit: string
  centerLabel: string
  items: {
    name: string
    value: number
    dotClassName?: string
  }[]
  chartElement: React.ReactNode
  bottomStats?: {
    label: string
    value: string
  }[]
  className?: string
}

export function DonutChartCard({
  title,
  centerValue,
  centerUnit,
  centerLabel,
  items,
  chartElement,
  bottomStats,
  className,
}: DonutChartCardProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div
      className={cn('rounded-2xl p-6 bg-card shadow-card border border-[hsl(var(--border)/0.18)]', className)}
      data-slot="donut-chart-card"
    >
      <h3 className="text-[18px] font-black text-foreground mb-6">
        {title}
      </h3>

      <div className="flex gap-6">
        <div className="flex-shrink-0">{chartElement}</div>

        <div className="flex-1 space-y-3.5">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className={cn('size-3 rounded-full', item.dotClassName)} />
              <span className="flex-1 text-[13px] font-black text-foreground">
                {item.name}
              </span>
              <span className="text-[15px] font-bold text-foreground">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-[24px] font-bold leading-none text-foreground">
          {centerValue}
          <span className="text-[12px] text-muted-foreground ms-1">
            {centerUnit}
          </span>
        </p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
          {centerLabel}
        </p>
      </div>

      {bottomStats && bottomStats.length > 0 && (
        <div className="border-t border-border pt-5 mt-6 grid grid-cols-2 gap-3">
          {bottomStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-[16px] font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}