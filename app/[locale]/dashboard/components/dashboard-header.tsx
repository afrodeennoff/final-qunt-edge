'use client'

import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import {
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useDashboardActions, useDashboardFilters } from '@/context/data-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import dynamic from 'next/dynamic'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const FilterCommandMenu = dynamic(
  () => import('./filters/filter-command-menu').then((m) => m.FilterCommandMenu),
  {  loading: () => null },
)
const ImportButton = dynamic(() => import('./import/import-button'), { loading: () => null })
const DailySummaryModal = dynamic(
  () => import('./daily-summary-modal').then((m) => m.DailySummaryModal),
  {  loading: () => null },
)
const GlobalSyncButton = dynamic(
  () => import('./global-sync-button').then((m) => m.GlobalSyncButton),
  {  loading: () => null },
)
const ActiveFilterTags = dynamic(
  () => import('./filters/active-filter-tags').then((m) => m.ActiveFilterTags),
  {  loading: () => null },
)
const DashboardHeaderWidgetControls = dynamic(
  () => import('./dashboard-header-widget-controls').then((m) => m.DashboardHeaderWidgetControls),
  {  loading: () => null },
)

export function DashboardHeader() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { state: sidebarState } = useSidebar()
  const { isPlusUser } = useDashboardActions()
  const { accountNumbers, instruments, dateRange, pnlRange, tagFilter, weekdayFilter } =
    useDashboardFilters()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'widgets'
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isDashboardRoot = /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?)?\/dashboard$/i.test(normalizedPathname)
  const isWidgetsTab = activeTab === 'widgets'
  const isSidebarCollapsed = !isMobile && sidebarState === 'collapsed'
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i)
  const billingHref = localeMatch?.[1]
    ? `/${localeMatch[1]}/dashboard/billing`
    : '/dashboard/billing'

  const getTitle = () => {
    if (isDashboardRoot) {
      if (activeTab === 'table') return 'Journal'
      if (activeTab === 'accounts') return 'Accounts'
      if (activeTab === 'chart') return 'Scenario Lab'
      return 'Home'
    }
    if (pathname.includes('strategies')) return 'Playbook'
    if (pathname.includes('reports')) return 'Analytics'
    if (pathname.includes('behavior')) return 'Coaching'
    if (pathname.includes('trader-profile')) return 'Profile'
    if (pathname.includes('calendar')) return 'Calendar'
    if (pathname.includes('data')) return 'Data'
    if (pathname.includes('settings')) return 'Settings'
    if (pathname.includes('billing')) return 'Billing'
    return 'Dashboard'
  }

  const title = getTitle()
  const sectionLabel = 'Dashboard'
  const showSectionLabel = !isDashboardRoot
  const subtitle = isDashboardRoot
    ? activeTab === 'table'
      ? 'Review executions, annotate trades, and move through your daily journal.'
      : activeTab === 'accounts'
        ? 'Track balances, challenge pressure, and account consistency in one place.'
        : activeTab === 'chart'
          ? 'Explore forward-looking scenarios and projection experiments.'
          : 'Your trading operating system for review, risk, and momentum.'
    : 'Focused workspace for analysis, review, and execution.'
  const hasActiveFilters =
    (accountNumbers?.length || 0) > 0 ||
    (instruments?.length || 0) > 0 ||
    Boolean(dateRange && (dateRange.from || dateRange.to)) ||
    Boolean(pnlRange && (pnlRange.min !== undefined || pnlRange.max !== undefined)) ||
    (tagFilter?.tags?.length || 0) > 0 ||
    Boolean(weekdayFilter?.days && weekdayFilter.days.length > 0)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full shrink-0 px-3 pb-2 pt-3 transition-[opacity,background-color,border-color] duration-300 sm:px-4 sm:pb-3 sm:pt-4',
        isMobile && 'pt-[calc(env(safe-area-inset-top)+0.75rem)]',
      )}
      data-dashboard-header="true"
    >
      <div className="relative mx-auto max-w-[1800px]">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-16 rounded-b-2xl border border-border/25 bg-background/40" />
        <div
          className={cn(
            unifiedSectionPanelClassName,
            'relative flex min-h-[5rem] items-center justify-between gap-3 overflow-hidden px-3 py-3 transition-[opacity,background-color,border-color] duration-300 sm:gap-4 sm:px-4',
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
          <div className="pointer-events-auto relative z-10 flex min-w-0 items-center gap-2.5 pr-3 sm:gap-3 sm:pr-4">
            <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl border border-border/30 bg-background/40 text-muted-foreground transition-[background-color,border-color,color] duration-200 hover:border-border/50 hover:bg-background/60 hover:text-foreground md:h-9 md:w-9" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-8 w-px bg-border/40 sm:block" />
              <div className="min-w-0 max-w-[min(32rem,44vw)]">
                <div className="flex items-center gap-2.5">
                  {showSectionLabel && (
                    <span
                      className={cn(
                        'hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em]',
                        'border-border/40 bg-background/60 text-muted-foreground',
                      )}
                    >
                      {sectionLabel}
                    </span>
                  )}
                  <h1 className="truncate text-[11px] font-bold tracking-[0.14em] text-foreground sm:text-sm sm:uppercase sm:tracking-[0.18em]">
                    {title}
                  </h1>
                </div>
                <p className="hidden truncate pt-1 text-xs text-muted-foreground xl:block">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto relative z-10 flex min-w-0 flex-1 items-center justify-end">
            <div className="flex min-w-0 w-full items-center justify-end gap-1.5">
              <div className="flex min-w-0 items-center gap-1">
                <FilterCommandMenu
                  variant="navbar"
                  className={cn(
                    isSidebarCollapsed
                      ? 'w-[clamp(280px,34vw,460px)]'
                      : 'w-[clamp(220px,24vw,360px)]',
                  )}
                />

                {!isMobile && <GlobalSyncButton />}

                {!isMobile && <DailySummaryModal />}
              </div>

              <div className="hidden sm:flex items-center gap-1">
                <ImportButton />

                {!isPlusUser() && (
                  <Link href={billingHref}>
                    <button
                      className={cn(
                        unifiedPrimaryActionClassName,
                        'group h-9 px-3.5 text-[10px] uppercase tracking-[0.22em]',
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Upgrade</span>
                    </button>
                  </Link>
                )}
              </div>

              {!isMobile && isDashboardRoot && isWidgetsTab ? (
                <DashboardHeaderWidgetControls isMobile={isMobile} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isMobile && isDashboardRoot && isWidgetsTab ? (
        <div className="relative mx-auto max-w-[1800px] pt-2">
          <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-2 py-2 sm:px-3')}>
            <DashboardHeaderWidgetControls isMobile={isMobile} />
          </div>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="relative mx-auto max-w-[1800px] pt-2">
          <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-3 py-2.5')}>
            <ActiveFilterTags showAccountNumbers={true} />
          </div>
        </div>
      ) : null}
    </header>
  )
}
