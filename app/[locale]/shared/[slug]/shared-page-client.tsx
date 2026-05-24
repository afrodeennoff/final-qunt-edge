'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  unifiedChipClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { format } from 'date-fns'
import { useData } from '@/context/data-provider'
import { SharedWidgetCanvas } from './shared-widget-canvas'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import { Loader2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'

// Create a client component for the accounts selection
function AccountsSelector({ accounts }: { accounts: string[] }) {
  const { accountNumbers, setAccountNumbers } = useData()
  const t = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleAccounts = isExpanded ? accounts : accounts.slice(0, 2)
  const remainingAccounts = accounts.length - 2

  const toggleAccount = (account: string) => {
    if (accountNumbers.includes(account)) {
      setAccountNumbers(accountNumbers.filter((a: string) => a !== account))
    } else {
      setAccountNumbers([...accountNumbers, account])
    }
  }

  const toggleAll = () => {
    if (accountNumbers.length === accounts.length) {
      setAccountNumbers([])
    } else {
      setAccountNumbers([...accounts])
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex flex-col justify-between gap-2 xs:flex-row xs:items-center xs:gap-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('shared.tradingAccounts')}</p>
        <div className="flex flex-wrap items-center gap-1.5 w-full xs:w-auto justify-end">
          {accounts.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 min-w-0 gap-1 text-xs text-foreground/60 hover:text-foreground"
            >
              {isExpanded
                ? t('shared.showLessAccounts')
                : t('shared.showMoreAccounts', { count: remainingAccounts })}
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform shrink-0',
                  isExpanded ? 'rotate-180' : '',
                )}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="h-7 min-w-0 whitespace-nowrap text-xs text-foreground/60 hover:text-foreground"
          >
            {accountNumbers.length === accounts.length
              ? t('shared.deselectAll')
              : t('shared.selectAll')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 xs:gap-2">
        {visibleAccounts.map((account) => (
          <button
            key={account}
            onClick={() => toggleAccount(account)}
            className={cn(
              "flex items-center rounded-xl border px-2 py-2 transition-[opacity,background-color,border-color,transform] duration-200 hover:-translate-y-0.5",
              accountNumbers.includes(account) 
                ? "border-border/40 bg-card/80 text-foreground shadow-[0_18px_36px_-26px_rgba(255,255,255,0.08)]"
                : "border-border/30 bg-background/30 text-muted-foreground hover:border-border/40 hover:bg-background/0.09"
            )}
          >
            <div
              className={cn(
                'mr-1.5 h-2.5 w-2.5 shrink-0 rounded-full xs:mr-2',
                accountNumbers.includes(account)
                  ? 'bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.7)]'
                  : 'bg-foreground/20',
              )}
            />
            <span className="text-xs xs:text-sm font-medium truncate" title={account}>
              {account}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function SharedPageClient() {
  const t = useI18n()
  const { isLoading, sharedParams } = useData()

  if (isLoading) {
    return (
      <div className="qe-v2-app-shell flex flex-col items-center justify-center px-4 pt-28 sm:pt-32">
        <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-[2rem] border border-border/30 bg-card px-6 py-8 text-center shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
          <p className="text-sm text-muted-foreground">{t('shared.loading')}</p>
        </div>
      </div>
    )
  }

  if (!sharedParams) {
    return (
      <div className="qe-v2-app-shell flex flex-col items-center justify-center px-4 pt-28 sm:pt-32">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>{t('shared.notFound')}</CardTitle>
            <CardDescription>{t('shared.notFoundDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const dateRange = sharedParams.dateRange as { from: Date; to: Date }

  return (
    <div className="container-fluid qe-v2-app-shell flex-1 pt-24 sm:pt-28">
      <main className="w-full py-6 lg:py-8">
        <MotionSection delay={0.04}>
          <Card className="mb-6 w-full overflow-hidden border-border/30 bg-card shadow-lg">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_340px] xl:gap-6">
                <div className="rounded-2xl border border-border/30 bg-background/30 p-5 sm:p-6">
                  <CardHeader className="space-y-4 p-0">
                    <div className="inline-flex w-fit rounded-full border border-border/0.08 bg-background/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Shared Report
                    </div>
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-xl font-[350] tracking-[-0.04em] sm:text-2xl lg:text-3xl">
                        {sharedParams.title || t('shared.title')}
                      </CardTitle>
                      <CardDescription className="max-w-3xl text-sm leading-[1.7] text-muted-foreground sm:text-base">
                        {sharedParams.description || t('shared.description')}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </div>

                <MotionStagger className="grid gap-4" delay={0.06}>
                  <MotionStaggerItem>
                    <Card className="border-border/30 bg-background/30 shadow-none">
                      <CardContent className="p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('shared.sharedOn')}</p>
                        <p className="text-sm text-foreground/70">
                          {format(new Date(sharedParams.createdAt || new Date()), 'PPP')}
                        </p>
                      </CardContent>
                    </Card>
                  </MotionStaggerItem>
                  <MotionStaggerItem>
                    <Card className="border-border/30 bg-background/30 shadow-none">
                      <CardContent className="p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          {dateRange.to ? t('shared.period') : t('shared.since')}
                        </p>
                        <p className="text-sm text-foreground/70">
                          {dateRange.to ? (
                            <>
                              {format(new Date(dateRange.from), 'PPP')}
                              {' - '}
                              {format(new Date(dateRange.to), 'PPP')}
                            </>
                          ) : (
                            format(new Date(dateRange.from), 'PPP')
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  </MotionStaggerItem>
                </MotionStagger>
              </div>

              <MotionSection delay={0.08}>
                <Card className="mt-4 border-border/30 bg-background/30 shadow-none">
                  <CardContent className="p-4">
                    <AccountsSelector accounts={sharedParams.accountNumbers} />
                  </CardContent>
                </Card>
              </MotionSection>
            </CardContent>
          </Card>
        </MotionSection>

        <MotionSection delay={0.1}>
          <SharedWidgetCanvas />
        </MotionSection>
      </main>
    </div>
  )
}
