'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import {
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'
import { WindowChrome } from '@/components/ui/window-chrome'
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
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const isDashboardRoot = /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?)?\/dashboard$/i.test(normalizedPathname)
  const isWidgetsTab = isDashboardRoot
  const isSidebarCollapsed = !isMobile && sidebarState === 'collapsed'
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i)
  const billingHref = localeMatch?.[1]
    ? `/${localeMatch[1]}/dashboard/billing`
    : '/dashboard/billing'

  const getTitle = () => {
    if (isDashboardRoot) return 'Home'
    if (pathname.includes('/dashboard/trades')) return 'Journal'
    if (pathname.includes('/dashboard/accounts')) return 'Accounts'
    if (pathname.includes('/dashboard/statistics')) return 'Statistics'
    if (pathname.includes('/dashboard/analytics')) return 'Trading Copilot'
    if (pathname.includes('trader-profile')) return 'Profile'
    if (pathname.includes('calendar')) return 'Calendar'
    if (pathname.includes('data')) return 'Data'
    if (pathname.includes('settings')) return 'Settings'
    if (pathname.includes('billing')) return 'Billing'
    return 'Dashboard'
  }

  const title = getTitle()
  const subtitle = isDashboardRoot
    ? 'Your trading command center'
    : pathname.includes('/dashboard/trades')
      ? 'Review, tag, and annotate your trade history'
      : pathname.includes('/dashboard/accounts')
        ? 'Track account growth, balances, and consistency'
        : pathname.includes('/dashboard/statistics')
          ? 'Performance breakdown by ticker, day, and setup tag'
          : pathname.includes('/dashboard/analytics')
            ? 'Behavioral analytics, performance reports, and AI-driven trade insights'
            : pathname.includes('trader-profile')
                  ? 'Your public trader profile'
                  : pathname.includes('calendar')
                    ? 'Calendar view of your trading activity'
                    : pathname.includes('data')
                      ? 'Manage your data imports'
                      : pathname.includes('settings')
                        ? 'Account and preference settings'
                        : pathname.includes('billing')
                          ? 'Manage your subscription'
                          : ''
  const sectionLabel = 'Dashboard'
  const showSectionLabel = !isDashboardRoot
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
        'sticky top-0 z-50 w-full shrink-0 px-3 pb-2 pt-3 transition-[opacity,background-color,border-color] duration-200 sm:px-4 sm:pb-2 sm:pt-4',
        isMobile && 'pt-[calc(env(safe-area-inset-top)+0.75rem)]',
      )}
      data-dashboard-header="true"
    >
      <div className={cn('relative mx-auto', WORKSPACE_SHELL_WIDTH)}>
        <div className="pointer-events-none absolute inset-x-4 top-0 h-16 rounded-b-2xl" />
        <div
          className={cn(
            'bg-background/80 border-0',
            'relative flex min-h-[5rem] items-center justify-between gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-300 sm:gap-4 sm:px-4',
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
            <div className="pointer-events-auto relative z-10 flex min-w-0 items-center gap-2 pr-3 sm:gap-3 sm:pr-4">
            <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl border-0 bg-background/40 text-muted-foreground transition-[background-color,border-color,color] duration-200 hover:border-transparent hover:bg-background/60 hover:text-foreground md:h-9 md:w-9" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-8 w-px bg-transparent/40 sm:block" />
              <div className="min-w-0 max-w-[min(32rem,44vw)]">
                <div className="flex items-center gap-2">
                  {showSectionLabel && (
                    <span
                      className={cn(
                        'hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
                        'border-transparent bg-background/60 text-muted-foreground',
                      )}
                    >
                      {sectionLabel}
                    </span>
                  )}
                  <h1 className="truncate text-[11px] font-bold tracking-[0.14em] text-foreground sm:text-sm sm:uppercase sm:tracking-[0.12em]">
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
                      ? 'w-[clamp(140px,20vw,280px)]'
                      : 'w-[clamp(120px,18vw,240px)]',
                    'max-w-[200px]',
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
                        'group h-9 px-4 text-[10px] uppercase tracking-[0.12em]',
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
        <div className={cn('relative mx-auto pt-2', WORKSPACE_SHELL_WIDTH)}>
          <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-2 py-2 sm:px-3')}>
            <DashboardHeaderWidgetControls isMobile={isMobile} />
          </div>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className={cn('relative mx-auto pt-2', WORKSPACE_SHELL_WIDTH)}>
          <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-3 py-2')}>
            <ActiveFilterTags showAccountNumbers={true} />
          </div>
        </div>
      ) : null}
    </header>
  )
}
