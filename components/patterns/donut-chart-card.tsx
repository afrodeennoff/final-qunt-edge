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
    color?: string
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
      className={cn('rounded-2xl p-6 bg-card shadow-card', className)}
      data-slot="donut-chart-card"
    >
      <h3 className="text-[18px] font-semibold text-text-primary mb-6">
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
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color || '#888' }}
              />
              <span className="flex-1 text-[13px] font-semibold text-text-primary">
                {item.name}
              </span>
              <span className="text-[15px] font-bold text-text-primary">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-[24px] font-bold leading-none text-text-primary">
          {centerValue}
          <span className="text-[12px] text-text-secondary ms-1">
            {centerUnit}
          </span>
        </p>
        <p className="text-[10px] uppercase tracking-wide text-text-tertiary mt-1">
          {centerLabel}
        </p>
      </div>

      {bottomStats && bottomStats.length > 0 && (
        <div className="border-t border-surface-muted pt-5 mt-6 grid grid-cols-2 gap-3">
          {bottomStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-[12px] text-text-tertiary mb-1">{stat.label}</p>
              <p className="text-[16px] font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}