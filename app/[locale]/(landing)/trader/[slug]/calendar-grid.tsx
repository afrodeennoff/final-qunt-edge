'use client'

import { addDays, format, startOfDay, subDays } from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarGrid({ dayPnl }: { dayPnl: Map<string, number> }) {
  const start = subDays(startOfDay(new Date()), 83)
  const days = Array.from({ length: 84 }, (_, idx) => addDays(start, idx))

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
        <div key={d} className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const key = day.toISOString().slice(0, 10)
        const value = dayPnl.get(key) ?? 0
        return (
          <div
            key={key}
            className={cn(
              'group relative rounded-lg border px-1.5 py-1.5 transition-[background-color,border-color] duration-150 sm:px-2',
              value > 0
                ? 'border-semantic-success/20 bg-semantic-success/8 hover:bg-semantic-success/14 hover:border-semantic-success/30'
                : value < 0
                  ? 'border-semantic-error/20 bg-semantic-error/8 hover:bg-semantic-error/14 hover:border-semantic-error/30'
                  : 'border-[rgba(0,0,0,0.05)] bg-[var(--card)] hover:bg-[var(--card)]',
            )}
          >
            <p className="text-[10px] leading-none text-muted-foreground/60">{format(day, 'd')}</p>
            <p className={cn(
              'mt-1 text-[11px] font-semibold tabular-nums leading-none',
              value > 0 ? 'text-semantic-success' : value < 0 ? 'text-semantic-error' : 'text-muted-foreground/40'
            )}>
              {value === 0 ? '\u2013' : `${value > 0 ? '+' : ''}${Math.round(value)}`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
