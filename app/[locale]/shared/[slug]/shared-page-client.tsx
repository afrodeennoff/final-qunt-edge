'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { useData } from "@/context/data-provider"
import { SharedWidgetCanvas } from "./shared-widget-canvas"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { Loader2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { MotionSection, MotionStagger, MotionStaggerItem } from "@/components/animation/enhanced-motion"

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
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-0 mb-2">
        <p className="text-sm font-medium text-v2-text-primary">{t('shared.tradingAccounts')}</p>
        <div className="flex flex-wrap items-center gap-1.5 w-full xs:w-auto justify-end">
          {accounts.length > 2 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs gap-1 min-w-0"
            >
              {isExpanded 
                ? t('shared.showLessAccounts')
                : t('shared.showMoreAccounts', { count: remainingAccounts })}
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform shrink-0",
                isExpanded ? "rotate-180" : ""
              )} />
            </Button>
          )}
          <Button  
            variant="ghost" 
            size="sm"
            onClick={toggleAll}
            className="h-7 text-xs whitespace-nowrap min-w-0"
          >
            {accountNumbers.length === accounts.length ? t('shared.deselectAll') : t('shared.selectAll')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 xs:gap-2">
        {visibleAccounts.map((account) => (
          <button
            key={account}
            onClick={() => toggleAccount(account)}
            className={cn(
              "flex items-center rounded-xl border px-2 py-2 transition-all duration-200 hover:-translate-y-0.5",
              accountNumbers.includes(account) 
                ? "border-v2-accent/55 bg-[linear-gradient(135deg,rgba(38,57,107,0.86),rgba(18,25,42,0.82))] text-v2-text-primary shadow-[0_18px_36px_-26px_rgba(37,99,235,0.88)]" 
                : "border-v2-border/40 bg-v2-bg-surface/72 text-v2-text-secondary hover:border-v2-border/70 hover:bg-v2-bg-hover"
            )}
          >
            <div className={cn(
              "mr-1.5 h-2.5 w-2.5 shrink-0 rounded-full xs:mr-2",
              accountNumbers.includes(account) 
                ? "bg-v2-accent shadow-[0_0_12px_rgba(56,189,248,0.7)]" 
                : "bg-v2-text-muted/35"
            )} />
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
        <div className="qe-v2-card flex w-full max-w-lg flex-col items-center gap-3 px-6 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-v2-text-secondary" />
          <p className="text-sm text-v2-text-secondary">{t('shared.loading')}</p>
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
            <CardDescription>
              {t('shared.notFoundDescription')}
            </CardDescription>
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
          <Card className="mb-6 w-full overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="inline-flex w-fit rounded-full border border-v2-border/30 bg-v2-bg-surface/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-v2-text-secondary">
                Shared Report
              </div>
              <div className="flex flex-col gap-2">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
                  {sharedParams.title || t('shared.title')}
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm sm:text-base">
                  {sharedParams.description || t('shared.description')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <MotionStagger className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <MotionStaggerItem>
                  <Card className="border-v2-border/35 bg-v2-bg-surface/68 shadow-none">
                    <CardContent className="p-4">
                      <p className="mb-1 text-sm font-medium">{t('shared.sharedOn')}</p>
                      <p className="text-sm text-v2-text-secondary">
                        {format(new Date(sharedParams.createdAt || new Date()), 'PPP')}
                      </p>
                    </CardContent>
                  </Card>
                </MotionStaggerItem>
                <MotionStaggerItem>
                  <Card className="border-v2-border/35 bg-v2-bg-surface/68 shadow-none">
                    <CardContent className="p-4">
                      <p className="mb-1 text-sm font-medium">
                        {dateRange.to ? t('shared.period') : t('shared.since')}
                      </p>
                      <p className="text-sm text-v2-text-secondary">
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

              <MotionSection delay={0.08}>
                <Card className="border-v2-border/35 bg-v2-bg-surface/68 shadow-none">
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
