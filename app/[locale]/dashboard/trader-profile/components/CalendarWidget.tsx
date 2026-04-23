'use client'

import { format } from 'date-fns'
import type { DayButtonProps } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const insetPanelClassName =
  'rounded-2xl border border-border/35 bg-background/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'

function formatPnlCell(value: number) {
  if (!Number.isFinite(value)) return '0'
  if (value === 0) return '0'
  const sign = value > 0 ? '+' : '-'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
}

interface CalendarWidgetProps {
  selectedDay: Date | undefined
  latestTradeDay: Date | undefined
  onSelectDay: (date: Date | undefined) => void
  positivePnlDays: Date[]
  negativePnlDays: Date[]
  tradePnlByDay: Map<string, number>
}

export default function CalendarWidget({
  selectedDay,
  latestTradeDay,
  onSelectDay,
  positivePnlDays,
  negativePnlDays,
  tradePnlByDay,
}: CalendarWidgetProps) {
  return (
    <Calendar
      mode="single"
      selected={selectedDay ?? latestTradeDay}
      onSelect={onSelectDay}
      defaultMonth={selectedDay ?? latestTradeDay}
      modifiers={{
        positive: positivePnlDays,
        negative: negativePnlDays,
      }}
      modifiersClassNames={{
        positive: 'bg-semantic-success-bg/20 text-semantic-success',
        negative: 'bg-semantic-error-bg text-semantic-error',
      }}
      className="w-full min-w-[19rem] p-0"
      classNames={{
        months: 'flex min-h-[26rem] flex-col gap-4 lg:min-h-[31rem]',
        month: 'space-y-4',
        weekday: 'w-11 text-center text-[0.75rem] font-medium text-muted-foreground sm:w-12',
        day: 'relative h-11 w-11 overflow-hidden rounded-lg p-0 text-center align-middle sm:h-12 sm:w-12',
        day_button:
          'h-11 w-11 rounded-lg p-0 font-normal text-foreground transition-[background-color,border-color,color] hover:bg-background/90 aria-selected:bg-primary/12 aria-selected:text-foreground sm:h-12 sm:w-12',
      }}
      components={{
        DayButton: ({ day, className, ...buttonProps }: DayButtonProps) => {
          const date = day.date
          const displayMonth = day.displayMonth

          if (date.getMonth() !== displayMonth.getMonth()) {
            return (
              <button type="button" {...buttonProps} className={className}>
                <span className="text-[11px] text-muted-foreground">{format(date, 'd')}</span>
              </button>
            )
          }

          const key = date.toISOString().slice(0, 10)
          const pnl = tradePnlByDay.get(key) ?? 0
          const hasTrade = tradePnlByDay.has(key)
          const tint =
            pnl > 0
              ? 'text-semantic-success'
              : pnl < 0
                ? 'text-semantic-error'
                : hasTrade
                  ? 'text-foreground'
                  : 'text-muted-foreground'

          return (
            <button type="button" {...buttonProps} className={className}>
              <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                <span className="text-[11px] leading-none">{format(date, 'd')}</span>
                <span className={`text-[10px] font-semibold leading-none ${tint}`}>
                  {hasTrade ? formatPnlCell(pnl) : ''}
                </span>
              </div>
            </button>
          )
        },
      }}
    />
  )
}
