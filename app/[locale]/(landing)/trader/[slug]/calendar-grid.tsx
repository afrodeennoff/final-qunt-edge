'use client'

import { addDays, format, startOfDay, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarGrid({ dayPnl }: { dayPnl: Map<string, number> }) {
  const start = subDays(startOfDay(new Date()), 83)
  const days = Array.from({ length: 84 }, (_, idx) => addDays(start, idx))
  const values = Array.from(dayPnl.values())
  const positiveCount = values.filter((v) => v > 0).length
  const negativeCount = values.filter((v) => v < 0).length
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1 sm:gap-[3px]">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="pb-1 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10)
          const value = dayPnl.get(key) ?? 0
          const absVal = Math.abs(value)
          const intensity = Math.min(0.95, Math.max(0.55, absVal / 800 + 0.55))
          return (
            <div
              key={key}
              title={`${format(day, 'MMM d, yyyy')}: ${value > 0 ? '+' : ''}${value.toFixed(0)} USD`}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-md border px-0.5 py-1 sm:py-1.5 transition-all duration-150 hover:scale-[1.08] hover:shadow-sm',
                value > 0
                  ? 'border-semantic-success/25 bg-semantic-success/8 hover:bg-semantic-success/15'
                  : value < 0
                    ? 'border-semantic-error/25 bg-semantic-error/8 hover:bg-semantic-error/15'
                    : 'border-border/50 bg-muted/10 hover:bg-muted/30',
              )}
              style={{ opacity: value !== 0 ? intensity : 0.6 }}
            >
              <p className="text-[9px] leading-none text-muted-foreground/50">{format(day, 'd')}</p>
              <p
                className={cn(
                  'mt-0.5 text-[9px] font-semibold tabular-nums leading-none',
                  value > 0 ? 'text-semantic-success' : value < 0 ? 'text-semantic-error' : 'text-muted-foreground/30',
                )}
              >
                {value === 0 ? '–' : `${value > 0 ? '+' : ''}${Math.round(value)}`}
              </p>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">
        <span>{positiveCount} winning days</span>
        <span>{negativeCount} losing days</span>
      </div>
    </div>
  )
}
