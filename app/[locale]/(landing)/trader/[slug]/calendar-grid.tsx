'use client'

import React, { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
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

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const weekTotals = weeks.map((week) =>
    week
      .filter((d) => isSameMonth(d, currentMonth))
      .reduce((sum, d) => sum + (dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0), 0),
  )

  const monthTradingDays = days.filter(
    (d) => isSameMonth(d, currentMonth) && (dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0) !== 0,
  )
  const monthValues = monthTradingDays.map((d) => dayPnl.get(format(d, 'yyyy-MM-dd')) ?? 0)
  const positiveCount = monthValues.filter((v) => v > 0).length
  const negativeCount = monthValues.filter((v) => v < 0).length
  const totalPnl = weekTotals.reduce((sum, v) => sum + v, 0)

  const totalWins = positiveCount + negativeCount
  const winRate = totalWins > 0 ? Math.round((positiveCount / totalWins) * 100) : 0
  const avgDaily = monthTradingDays.length > 0 ? Math.round(totalPnl / monthTradingDays.length) : 0

  return (
    <div className="space-y-5">
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
          <div
            className={cn(
              'text-[11px] font-medium',
              totalPnl > 0
                ? 'text-semantic-success'
                : totalPnl < 0
                  ? 'text-semantic-error'
                  : 'text-muted-foreground/50',
            )}
          >
            {totalPnl > 0 ? '+' : ''}
            {Math.round(totalPnl)} USD
          </div>
        </div>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-muted-foreground/60 backdrop-blur-sm transition hover:bg-white/30 hover:text-foreground active:scale-[0.95] dark:bg-zinc-800/20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[2px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="pb-2 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30"
          >
            {d}
          </div>
        ))}

        {weeks.map((week, weekIdx) => (
          <React.Fragment key={weekIdx}>
            {week.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const value = dayPnl.get(key) ?? 0
              const absVal = Math.abs(value)
              const intensity = Math.min(0.95, Math.max(0.2, absVal / 800 + 0.55))
              const inMonth = isSameMonth(day, currentMonth)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={key}
                  title={
                    inMonth
                      ? `${format(day, 'MMM d, yyyy')}: ${value > 0 ? '+' : ''}${value.toFixed(0)} USD`
                      : format(day, 'MMM d, yyyy')
                  }
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-md px-1 py-5 sm:py-7 transition-all duration-200 ease-out backdrop-blur-sm',
                    inMonth &&
                      value !== 0 &&
                      'hover:scale-[1.08] hover:shadow-md active:scale-[0.96]',
                    !inMonth && 'opacity-20',
                    inMonth && value > 0 && 'bg-semantic-success/8 hover:bg-semantic-success/15',
                    inMonth && value < 0 && 'bg-semantic-error/8 hover:bg-semantic-error/15',
                    inMonth && value === 0 && 'bg-white/5 dark:bg-zinc-800/10',
                    !inMonth && 'bg-transparent',
                    isCurrentDay && inMonth && 'ring-1 ring-white/20',
                  )}
                  style={{ opacity: inMonth && value !== 0 ? intensity : undefined }}
                >
                  <p
                    className={cn(
                      'text-[11px] leading-none',
                      isCurrentDay && inMonth
                        ? 'font-bold text-foreground'
                        : 'text-muted-foreground/50',
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                  {inMonth && value !== 0 && (
                    <p
                      className={cn(
                        'mt-0.5 text-[9px] font-semibold tabular-nums leading-none',
                        value > 0 ? 'text-semantic-success' : 'text-semantic-error',
                      )}
                    >
                      {value > 0 ? '+' : ''}
                      {Math.round(value)}
                    </p>
                  )}
                </div>
              )
            })}
            <div className="col-span-7 flex items-center justify-end gap-2 px-2 py-2">
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40">
                W{weekIdx + 1}
              </span>
              {weekTotals[weekIdx] !== 0 ? (
                <span
                  className={cn(
                    'text-[11px] font-semibold tabular-nums',
                    weekTotals[weekIdx] > 0 ? 'text-semantic-success' : 'text-semantic-error',
                  )}
                >
                  {weekTotals[weekIdx] > 0 ? '+' : ''}
                  {Math.round(weekTotals[weekIdx])}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/30">—</span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-semantic-success/30" />
            {positiveCount} win
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-semantic-error/30" />
            {negativeCount} loss
          </span>
          <span className="text-muted-foreground/40">
            {winRate}% WR
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/30">
          <span>μ {avgDaily}/day</span>
          <span>{monthTradingDays.length} days</span>
        </div>
      </div>
    </div>
  )
}
