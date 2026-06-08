'use client'

import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarGrid({ dayPnl }: { dayPnl: Map<string, number> }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const visibleValues = days
    .map((d) => dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0)
    .filter((v) => v !== 0)
  const positiveCount = visibleValues.filter((v) => v > 0).length
  const negativeCount = visibleValues.filter((v) => v < 0).length

  const totalPnl = Array.from(dayPnl.entries())
    .filter(([key]) => key.startsWith(format(currentMonth, 'yyyy-MM')))
    .reduce((sum, [, val]) => sum + val, 0)

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-muted-foreground/60 backdrop-blur-sm transition hover:bg-white/30 hover:text-foreground active:scale-[0.95] dark:bg-zinc-800/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold tracking-tight text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <div className={cn(
            'text-[11px] font-medium',
            totalPnl > 0 ? 'text-semantic-success' : totalPnl < 0 ? 'text-semantic-error' : 'text-muted-foreground/50'
          )}>
            {totalPnl > 0 ? '+' : ''}{Math.round(totalPnl)} USD
          </div>
        </div>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-muted-foreground/60 backdrop-blur-sm transition hover:bg-white/30 hover:text-foreground active:scale-[0.95] dark:bg-zinc-800/20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-[2px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30"
          >
            {d}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const value = dayPnl.get(key) ?? 0
          const absVal = Math.abs(value)
          const intensity = Math.min(0.95, Math.max(0.2, absVal / 800 + 0.55))
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={key}
              title={
                isCurrentMonth
                  ? `${format(day, 'MMM d, yyyy')}: ${value > 0 ? '+' : ''}${value.toFixed(0)} USD`
                  : format(day, 'MMM d, yyyy')
              }
              className={cn(
                'relative flex flex-col items-center justify-center rounded-md px-1 py-1.5 sm:py-2 transition-all duration-200 ease-out backdrop-blur-sm',
                isCurrentMonth && value !== 0 && 'hover:scale-[1.08] hover:shadow-md active:scale-[0.96]',
                !isCurrentMonth && 'opacity-20',
                isCurrentMonth && value > 0 && 'bg-semantic-success/8 hover:bg-semantic-success/15',
                isCurrentMonth && value < 0 && 'bg-semantic-error/8 hover:bg-semantic-error/15',
                isCurrentMonth && value === 0 && 'bg-white/5 dark:bg-zinc-800/10',
                !isCurrentMonth && 'bg-transparent',
                isCurrentDay && isCurrentMonth && 'ring-1 ring-white/20',
              )}
              style={{ opacity: isCurrentMonth && value !== 0 ? intensity : undefined }}
            >
              <p
                className={cn(
                  'text-[10px] leading-none',
                  isCurrentDay && isCurrentMonth ? 'font-bold text-foreground' : 'text-muted-foreground/50',
                )}
              >
                {format(day, 'd')}
              </p>
              {isCurrentMonth && value !== 0 && (
                <p
                  className={cn(
                    'mt-px text-[8px] font-semibold tabular-nums leading-none',
                    value > 0 ? 'text-semantic-success' : 'text-semantic-error',
                  )}
                >
                  {value > 0 ? '+' : ''}{Math.round(value)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-semantic-success/30" />
            {positiveCount} win
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-semantic-error/30" />
            {negativeCount} loss
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground/30">
          {positiveCount + negativeCount} trading days
        </div>
      </div>
    </div>
  )
}
