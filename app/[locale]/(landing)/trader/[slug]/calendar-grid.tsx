'use client'

import { addDays, format, startOfDay, subDays } from 'date-fns'

export function CalendarGrid({ dayPnl }: { dayPnl: Map<string, number> }) {
  const start = subDays(startOfDay(new Date()), 83)
  const days = Array.from({ length: 84 }, (_, idx) => addDays(start, idx))
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
        <div key={d} className="pb-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{d}</div>
      ))}
      {days.map((day) => {
        const key = day.toISOString().slice(0, 10)
        const value = dayPnl.get(key) ?? 0
        const tone = value > 0
          ? 'bg-semantic-success/15 border-semantic-success/30 text-semantic-success'
          : value < 0
            ? 'bg-semantic-error/15 border-semantic-error/30 text-semantic-error'
            : 'bg-muted/30 border-border/20 text-muted-foreground'
        return (
          <div key={key} className={`rounded-md border px-2 py-1.5 ${tone}`}>
            <p className="text-[10px] leading-none text-muted-foreground/70">{format(day, 'd')}</p>
            <p className="mt-1 text-[11px] font-semibold tabular-nums leading-none">{value === 0 ? '\u2013' : `${value > 0 ? '+' : ''}${Math.round(value)}`}</p>
          </div>
        )
      })}
    </div>
  )
}
