'use client'

import { ButtonV2, CardV2, CardV2Content, CardV2Description, CardV2Header, CardV2Title } from "@/components/ui/v2"
import { format } from "date-fns"
import { useData } from "@/context/data-provider"
import { SharedWidgetCanvas } from "./shared-widget-canvas"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { Loader2, ChevronDown } from "lucide-react"
import { useState } from "react"

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
        <p className="text-sm font-medium">{t('shared.tradingAccounts')}</p>
        <div className="flex flex-wrap items-center gap-1.5 w-full xs:w-auto justify-end">
          {accounts.length > 2 && (
            <ButtonV2 
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
            </ButtonV2>
          )}
          <ButtonV2  
            variant="ghost" 
            size="sm"
            onClick={toggleAll}
            className="h-7 text-xs whitespace-nowrap min-w-0"
          >
            {accountNumbers.length === accounts.length ? t('shared.deselectAll') : t('shared.selectAll')}
          </ButtonV2>
        </div>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 xs:gap-2">
        {visibleAccounts.map((account) => (
          <button
            key={account}
            onClick={() => toggleAccount(account)}
            className={cn(
              "flex items-center p-1.5 xs:p-2 rounded-md border transition-colors hover:bg-muted/50",
              accountNumbers.includes(account) 
                ? "bg-primary/10 border-primary/50" 
                : "bg-background border-border"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full mr-1.5 xs:mr-2 shrink-0",
              accountNumbers.includes(account) 
                ? "bg-primary" 
                : "bg-muted-foreground/30"
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
      <div className="flex flex-col items-center justify-center pt-28 sm:pt-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('shared.loading')}</p>
      </div>
    )
  }

  if (!sharedParams) {
    return (
      <div className="flex flex-col items-center justify-center pt-28 sm:pt-32">
        <CardV2 className="max-w-lg w-full">
          <CardV2Header>
            <CardV2Title>{t('shared.notFound')}</CardV2Title>
            <CardV2Description>
              {t('shared.notFoundDescription')}
            </CardV2Description>
          </CardV2Header>
        </CardV2>
      </div>
    )
  }

  const dateRange = sharedParams.dateRange as { from: Date; to: Date }

  return (
    <div className="container-fluid flex-1 pt-28 sm:pt-32">
      <main className="w-full py-6 lg:py-8">
        <CardV2 className="mb-6 w-full">
          <CardV2Header className="space-y-3">
            <div className="flex flex-col gap-2">
              <CardV2Title className="text-xl sm:text-2xl">
                {sharedParams.title || t('shared.title')}
              </CardV2Title>
              <CardV2Description className="text-sm sm:text-base">
                {sharedParams.description || t('shared.description')}
              </CardV2Description>
            </div>
          </CardV2Header>
          <CardV2Content className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <CardV2 className="p-4 border-none shadow-none bg-muted/50">
                <p className="text-sm font-medium mb-1">{t('shared.sharedOn')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(sharedParams.createdAt || new Date()), "PPP")}
                </p>
              </CardV2>
              <CardV2 className="p-4 border-none shadow-none bg-muted/50">
                <p className="text-sm font-medium mb-1">
                  {dateRange.to ? t('shared.period') : t('shared.since')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dateRange.to ? (
                    <>
                      {format(new Date(dateRange.from), "PPP")}
                      {" - "}
                      {format(new Date(dateRange.to), "PPP")}
                    </>
                  ) : (
                    format(new Date(dateRange.from), "PPP")
                  )}
                </p>
              </CardV2>
            </div>
            
            <CardV2 className="p-4 border-none shadow-none bg-muted/50">
              <AccountsSelector accounts={sharedParams.accountNumbers} />
            </CardV2>
          </CardV2Content>
        </CardV2>

        <SharedWidgetCanvas />
      </main>
    </div>
  )
}
