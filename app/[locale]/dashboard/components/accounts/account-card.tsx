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
      className="group relative flex h-full min-h-[18rem] w-full flex-col overflow-hidden rounded-xl border-0 bg-card transition-all"
      onClick={onClick}
    >
      <CardHeader className="flex-none gap-2 border-b-0 bg-muted/30 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle size={isCompact ? 'md' : 'lg'} className="truncate font-semibold tracking-tight">
              {account.propfirm || t('propFirm.card.unnamedAccount')}
            </CardTitle>
            <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground/70">
              {account.number}
            </p>
          </div>
          {account.nextPaymentDate && daysUntilNextPayment !== null ? (
            <div
              className={cn(
                'shrink-0 rounded-full border-0 bg-muted/30 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground',
                daysUntilNextPayment < 5 && 'text-destructive',
              )}
            >
              {daysUntilNextPayment}d
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3 border-b-0 pb-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">{t('propFirm.card.balance')}</span>
          <span className={cn('font-semibold tabular-nums text-foreground', isCompact ? 'text-lg' : 'text-2xl')}>
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-muted-foreground/70">{t('propFirm.card.remainingToTarget')}</span>
                <span className={cn('tabular-nums font-medium', remainingToTarget <= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--destructive)]')}>
                  ${remainingToTarget.toFixed(0)}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-muted/40"
                indicatorClassName="bg-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground/70">{t('propFirm.card.drawdown')}</span>
                <span className={cn('tabular-nums font-medium', remainingLoss > drawdownThreshold * 0.5 ? 'text-success' : 'text-destructive')}>
                  {remainingLoss > 0 ? `$${remainingLoss.toFixed(0)} left` : 'Breached'}
                </span>
              </div>
              <Progress
                value={drawdownProgress}
                className="h-2 bg-muted/40"
                indicatorClassName="bg-primary transition-all"
              />
            </div>

            {metrics && (size === 'large' || size === 'extra-large') ? (
              <div className="mt-auto space-y-1.5 border-t-0 pt-3 text-[12px]">
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Consistency</span>
                  <span className={cn(
                    'font-medium',
                    !metrics.hasProfitableData ? 'text-muted-foreground' :
                    metrics.isConsistent || consistencyPercentage === 100 ? 'text-[color:var(--success)]' : 'text-[color:var(--destructive)]'
                  )}>
                    {!metrics.hasProfitableData ? '—' : metrics.isConsistent || consistencyPercentage === 100 ? 'Consistent' : 'Inconsistent'}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Max Daily Profit Allowed</span>
                  <span className="tabular-nums text-foreground">${metrics.maxAllowedDailyProfit?.toFixed(0) || '—'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground/70">
                  <span>Highest Profit Day</span>
                  <span className="tabular-nums text-foreground">${metrics.highestProfitDay?.toFixed(0) || '—'}</span>
                </div>
                <div className="flex justify-between border-t-0 pt-2 text-muted-foreground/70">
                  <span>Trading Days</span>
                  <span className={cn(
                    'font-medium tabular-nums',
                    metrics.validTradingDays === metrics.totalTradingDays ? 'text-[color:var(--success)]' : 'text-[color:var(--destructive)]'
                  )}>
                    {metrics.validTradingDays}/{metrics.totalTradingDays}
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
