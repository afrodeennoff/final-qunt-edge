'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { unifiedInsetPanelClassName, unifiedMetricPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

export default function DashboardPreview() {
  const t = useI18n()

  const stats = [
    {
      label: t('landing.home.preview.stat1Label'),
      value: '$12,847',
      change: '+34.2%',
      positive: true,
    },
    {
      label: t('landing.home.preview.stat2Label'),
      value: '78%',
      change: '+2.4%',
      positive: true,
    },
    {
      label: t('landing.home.preview.stat3Label'),
      value: '2.34',
      change: '+0.12',
      positive: true,
    },
  ]

  const bars = [52, 66, 61, 76, 82, 72, 90, 84, 93, 88, 96, 92]

  const trades = [
    { symbol: 'ES', side: t('landing.home.preview.long'), pnl: '+$420', time: '10:32' },
    { symbol: 'NQ', side: t('landing.home.preview.short'), pnl: '-$180', time: '10:45' },
    { symbol: 'RTY', side: t('landing.home.preview.long'), pnl: '+$290', time: '11:15' },
  ]

  return (
    <div
      className="relative mx-auto h-full w-full [font-family:var(--hero-copy)]"
      role="img"
      aria-label={String(t('landing.home.preview.ariaLabel'))}
    >
      <div className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-border/35 bg-black/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/80" />
            </div>
            <span className="rounded-full border border-border/35 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t('landing.home.preview.demo')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-success">
              {t('landing.home.preview.live')}
            </span>
          </div>
        </div>

        <div className="grid flex-1 gap-4 pt-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={String(stat.label)} className={cn(unifiedMetricPanelClassName, 'space-y-2 p-4')}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-[1.55rem] font-semibold leading-none tracking-[-0.04em] text-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {stat.positive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className={stat.positive ? 'text-success' : 'text-destructive'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn(unifiedInsetPanelClassName, 'relative min-h-[270px] overflow-hidden p-4 sm:p-5')}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Session curve
                </p>
                <div className="flex gap-2">
                  <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
                    +$12,847 {t('landing.home.preview.pnlChip')}
                  </span>
                  <span className="rounded-full border border-primary/18 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    78% {t('landing.home.preview.winRateChip')}
                  </span>
                </div>
              </div>

              <div className="relative h-[190px] overflow-hidden rounded-xl border border-border/30 bg-background/78">
                <div className="absolute inset-x-0 top-0 flex h-full items-end justify-around gap-1 px-3 pb-3 sm:px-4 sm:pb-4">
                  {bars.map((height, index) => (
                    <span
                      key={index}
                      className="w-3 rounded-full bg-primary/75 sm:w-4"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <svg viewBox="0 0 420 180" className="absolute inset-0 h-full w-full">
                  <path
                    d="M12 132 C64 124, 112 118, 156 96 C200 74, 238 82, 272 62 C312 38, 350 44, 408 18"
                    fill="none"
                    stroke="hsl(var(--primary) / 0.92)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="rounded-full border border-border/30 bg-background/70 px-3 py-1">
                  2.34 {t('landing.home.preview.profitFactorChip')}
                </span>
                <span className="rounded-full border border-border/30 bg-background/70 px-3 py-1">
                  review cadence: live
                </span>
              </div>
            </div>
          </div>

          <div className={cn(unifiedInsetPanelClassName, 'flex flex-col p-4 sm:p-5')}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.preview.recentTrades')}
              </p>
              <span className="rounded-full border border-border/30 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                3 filled
              </span>
            </div>

            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={`${trade.symbol}-${trade.time}`}
                  className="rounded-lg border border-border/30 bg-background/78 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                        {trade.symbol}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {trade.side}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-semibold tracking-[-0.02em]',
                          trade.pnl.startsWith('+') ? 'text-success' : 'text-destructive',
                        )}
                      >
                        {trade.pnl}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {trade.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/30 bg-background/78 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Risk channel
                </p>
                <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
                  controlled exposure
                </p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/78 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Active review
                </p>
                <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
                  benchmark linked
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
