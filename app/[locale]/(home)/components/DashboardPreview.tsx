'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
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

  const bars = [65, 72, 68, 85, 78, 92, 88, 95, 82, 100, 94, 98]

  const trades = [
    { symbol: 'ES', side: t('landing.home.preview.long'), pnl: '+$420', time: '10:32' },
    { symbol: 'NQ', side: t('landing.home.preview.short'), pnl: '-$180', time: '10:45' },
    { symbol: 'RTY', side: t('landing.home.preview.long'), pnl: '+$290', time: '11:15' },
  ]

  return (
    <div
      className="relative mx-auto w-full max-w-5xl [font-family:var(--hero-copy)]"
      role="img"
      aria-label={String(t('landing.home.preview.ariaLabel'))}
    >
      <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card/90 shadow-sm">
        <span className="type-label absolute right-4 top-4 z-10 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
          {t('landing.home.preview.demo')}
        </span>

        <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-4 sm:px-5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/80" />
            <div className="h-3 w-3 rounded-full bg-warning/80" />
            <div className="h-3 w-3 rounded-full bg-success/80" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <div className="hidden h-6 w-[220px] rounded-full border border-border/50 bg-card/70 sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="type-label text-success">{t('landing.home.preview.live')}</span>
            </div>
          </div>
          <div className="h-6 w-10 rounded-full border border-border/50 bg-card/70 sm:w-16" />
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={String(stat.label)}
                className="rounded-md border border-border/60 bg-background/70 p-4 shadow-sm"
              >
                <p className="type-label mb-2 text-muted-foreground">{stat.label}</p>
                <p className="tabular-nums text-[1.75rem] leading-[1.1] tracking-[-0.03em] text-foreground [font-family:var(--hero-display)] font-semibold">
                  {stat.value}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {stat.positive ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className="tabular-nums text-xs font-semibold text-success">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="relative h-44 overflow-hidden rounded-md border border-border/60 bg-background/70 sm:h-52">
              <div className="absolute inset-0 grid grid-cols-12">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="border-r border-border/30" />
                ))}
              </div>

              <div className="absolute inset-0 flex items-end justify-around px-2 pb-3 sm:px-4 sm:pb-4">
                {bars.map((height, index) => (
                  <div
                    key={index}
                    className="w-3.5 rounded-t-md bg-gradient-to-t from-primary via-primary/70 to-accent/30 sm:w-5"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="absolute right-2 top-2 sm:right-4 sm:top-3">
                <span className="type-label rounded-full border border-success/25 bg-success/10 px-3 py-1 text-success">
                  +$12,847 {t('landing.home.preview.pnlChip')}
                </span>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-[45%] sm:top-[45%]">
                <span className="type-label rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-primary">
                  78% {t('landing.home.preview.winRateChip')}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                <span className="type-label rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-warning">
                  2.34 {t('landing.home.preview.profitFactorChip')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/70 p-4">
            <p className="type-label mb-3 text-muted-foreground">
              {t('landing.home.preview.recentTrades')}
            </p>
            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={`${trade.symbol}-${trade.time}`}
                  className="flex items-center justify-between rounded-md border border-border/50 bg-card/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {trade.symbol}
                    </span>
                    <span className="type-label text-muted-foreground">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={
                        trade.pnl.startsWith('+')
                          ? 'tabular-nums font-medium text-success'
                          : 'tabular-nums font-medium text-destructive'
                      }
                    >
                      {trade.pnl}
                    </span>
                    <span className="type-label tabular-nums text-muted-foreground">
                      {trade.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
