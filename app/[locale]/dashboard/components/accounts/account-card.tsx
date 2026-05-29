'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import { TradeProgressChart } from './trade-progress-chart'
import { Account } from '@/lib/data-types'
import { WidgetSize } from '../../types/dashboard'

interface AccountCardProps {
  account: Account
  onClick?: () => void
  size?: WidgetSize
}

export function AccountCard({ account, onClick, size = 'large' }: AccountCardProps) {
  const t = useI18n()
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const isCompact = size === 'small' || size === 'small-long'

  useEffect(() => {
    if (!account.nextPaymentDate) return
    const intervalId = setInterval(
      () => {
        setCurrentTime(Date.now())
      },
      60 * 60 * 1000,
    )
    return () => clearInterval(intervalId)
  }, [account.nextPaymentDate])

  const daysUntilNextPayment = useMemo(() => {
    if (!account.nextPaymentDate) return null
    return Math.floor(
      (new Date(account.nextPaymentDate).getTime() - currentTime) / (1000 * 60 * 60 * 24),
    )
  }, [account.nextPaymentDate, currentTime])

  // Extract metrics from account (computed server-side)
  const metrics = account.metrics
  const isConfigured = metrics?.isConfigured ?? false
  const currentBalance = metrics?.currentBalance ?? account.startingBalance ?? 0
  const remainingToTarget = metrics?.remainingToTarget ?? 0
  const progress = metrics?.progress ?? 0
  const drawdownProgress = metrics?.drawdownProgress ?? 0
  const remainingLoss = metrics?.remainingLoss ?? 0
  const drawdownThreshold = Number(account.drawdownThreshold ?? 0)
  const consistencyPercentage = Number(account.consistencyPercentage ?? 0)
  const minPnlToCountAsDay = Number(account.minPnlToCountAsDay ?? 0)

  return (
    <Card
      hover
      clickable={Boolean(onClick)}
      className="group relative flex h-full min-h-[18rem] w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--primary) / 0.025) 0%, hsl(var(--card)) 100%)',
      }}
      onClick={onClick}
    >
      <CardHeader className="flex-none gap-3 border-b border-border/60 bg-card/60 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle size={isCompact ? 'md' : 'xl'} className="truncate">
              {account.propfirm || t('propFirm.card.unnamedAccount')}
            </CardTitle>
            <p className="type-body-sm mt-1 truncate tabular-nums text-muted-foreground">
              {account.number}
            </p>
          </div>
          {account.nextPaymentDate && daysUntilNextPayment !== null ? (
            <div
              className={cn(
                'type-label shrink-0 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 tabular-nums',
                daysUntilNextPayment < 5 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {daysUntilNextPayment}
              {t('propFirm.card.daysBeforeNextPayment')}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-4">
          <span className="type-overline text-muted-foreground">{t('propFirm.card.balance')}</span>
          <span
            className={cn(
              'truncate text-foreground tabular-nums',
              isCompact ? 'type-h4 font-semibold' : 'type-h3 font-semibold',
            )}
          >
            $
            {currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {isConfigured ? (
          <div className="flex flex-1 flex-col gap-4">
            {(size === 'large' || size === 'extra-large') && account.payouts ? (
              <TradeProgressChart account={account} />
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="type-label text-muted-foreground">
                  {t('propFirm.card.remainingToTarget')}
                </span>
                <span
                  className={cn(
                    'type-label tabular-nums',
                    remainingToTarget <= 0 ? 'metric-positive' : 'metric-negative',
                  )}
                >
                  $
                  {remainingToTarget.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Progress
                value={progress}
                className={cn('bg-muted', isCompact ? 'h-1' : 'h-1.5')}
                indicatorClassName={cn(
                  'transition-[opacity,background-color,border-color] duration-500 bg-primary',
                  progress <= 20
                    ? 'opacity-20 shadow-none'
                    : progress <= 40
                      ? 'opacity-40 shadow-none'
                      : progress <= 60
                        ? 'opacity-60 shadow-none'
                        : progress <= 80
                          ? 'opacity-85 shadow-none chart-positive-emphasis'
                          : 'opacity-100 shadow-none chart-positive-emphasis',
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="type-label text-muted-foreground">
                  {t('propFirm.card.drawdown')}
                </span>
                <span
                  className={cn(
                    'type-label truncate tabular-nums',
                    remainingLoss > drawdownThreshold * 0.5 ? 'metric-positive' : 'metric-negative',
                  )}
                >
                  {remainingLoss > 0
                    ? t('propFirm.card.remainingLoss', { amount: remainingLoss.toFixed(2) })
                    : t('propFirm.card.drawdownBreached')}
                </span>
              </div>
              <Progress
                value={drawdownProgress}
                className={cn('bg-muted', isCompact ? 'h-1' : 'h-1.5')}
                indicatorClassName={cn(
                  'transition-[opacity,background-color,border-color] duration-500 bg-primary/50',
                  drawdownProgress <= 40
                    ? 'opacity-90 chart-positive-emphasis'
                    : drawdownProgress <= 70
                      ? 'opacity-50'
                      : 'opacity-100 chart-negative-muted',
                )}
              />
            </div>

            {metrics && (size === 'large' || size === 'extra-large') ? (
              <div className="mt-auto space-y-2 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="type-label text-muted-foreground">
                    {t('propFirm.card.consistency')}
                  </span>
                  <span
                    className={cn(
                      'type-label tabular-nums',
                      !metrics.hasProfitableData
                        ? 'text-muted-foreground italic'
                        : metrics.isConsistent || consistencyPercentage === 100
                          ? 'metric-positive'
                          : 'metric-negative',
                    )}
                  >
                    {!metrics.hasProfitableData
                      ? t('propFirm.status.unprofitable')
                      : metrics.isConsistent || consistencyPercentage === 100
                        ? t('propFirm.status.consistent')
                        : t('propFirm.status.inconsistent')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 type-body-sm text-muted-foreground">
                  <span>{t('propFirm.card.maxAllowedDailyProfit')}</span>
                  <span className="tabular-nums">
                    ${metrics.maxAllowedDailyProfit?.toLocaleString() || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 type-body-sm text-muted-foreground">
                  <span>{t('propFirm.card.highestDailyProfit')}</span>
                  <span className="tabular-nums">
                    ${metrics.highestProfitDay?.toLocaleString() || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                  <span className="type-label text-muted-foreground">
                    {t('propFirm.card.tradingDays')}
                  </span>
                  <span
                    className={cn(
                      'type-label tabular-nums',
                      metrics.validTradingDays === metrics.totalTradingDays
                        ? 'metric-positive'
                        : 'metric-negative',
                    )}
                  >
                    {metrics.validTradingDays}/{metrics.totalTradingDays}
                    {minPnlToCountAsDay > 0 ? (
                      <span className="ml-1 text-muted-foreground">(≥${minPnlToCountAsDay})</span>
                    ) : null}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="type-body-sm pt-2 text-center italic text-muted-foreground">
            {t('propFirm.card.needsConfiguration')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
