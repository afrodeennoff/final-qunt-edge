
"use client"

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useDashboardActions, useDashboardFilters } from '@/context/data-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import dynamic from 'next/dynamic';
import {
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

const FilterCommandMenu = dynamic(
    () => import('./filters/filter-command-menu').then((m) => m.FilterCommandMenu),
    { ssr: false, loading: () => null }
)
const ImportButton = dynamic(() => import('./import/import-button'), { ssr: false, loading: () => null })
const DailySummaryModal = dynamic(
    () => import('./daily-summary-modal').then((m) => m.DailySummaryModal),
    { ssr: false, loading: () => null }
)
const GlobalSyncButton = dynamic(
    () => import('./global-sync-button').then((m) => m.GlobalSyncButton),
    { ssr: false, loading: () => null }
)
const ActiveFilterTags = dynamic(
    () => import('./filters/active-filter-tags').then((m) => m.ActiveFilterTags),
    { ssr: false, loading: () => null }
)
const DashboardHeaderWidgetControls = dynamic(
    () => import('./dashboard-header-widget-controls').then((m) => m.DashboardHeaderWidgetControls),
    { ssr: false, loading: () => null }
)

export function DashboardHeader() {
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const { state: sidebarState } = useSidebar();
    const { isPlusUser } = useDashboardActions();
    const {
        accountNumbers,
        instruments,
        dateRange,
        pnlRange,
        tagFilter,
        weekdayFilter,
    } = useDashboardFilters();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'widgets';
    const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
    const isDashboardRoot = /^\/(?:[a-z]{2}(?:-[A-Za-z]{2})?)?\/dashboard$/i.test(normalizedPathname);
    const isWidgetsTab = activeTab === 'widgets';
    const isSidebarCollapsed = !isMobile && sidebarState === 'collapsed';
    const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i);
    const billingHref = localeMatch?.[1] ? `/${localeMatch[1]}/dashboard/billing` : '/dashboard/billing';

    const getTitle = () => {
        if (isDashboardRoot) {
            if (activeTab === 'table') return 'Journal';
            if (activeTab === 'accounts') return 'Accounts';
            if (activeTab === 'chart') return 'Scenario Lab';
            return 'Home';
        }
        if (pathname.includes('strategies')) return 'Playbook';
        if (pathname.includes('reports')) return 'Analytics';
        if (pathname.includes('behavior')) return 'Coaching';
        if (pathname.includes('trader-profile')) return 'Profile';
        if (pathname.includes('calendar')) return 'Calendar';
        if (pathname.includes('data')) return 'Data';
        if (pathname.includes('settings')) return 'Settings';
        if (pathname.includes('billing')) return 'Billing';
        return 'Dashboard';
    };

    const title = getTitle();
    const sectionLabel = "Dashboard";
    const showSectionLabel = !isDashboardRoot;
    const subtitle = isDashboardRoot
        ? (
            activeTab === 'table'
                ? 'Review executions, annotate trades, and move through your daily journal.'
                : activeTab === 'accounts'
                    ? 'Track balances, challenge pressure, and account consistency in one place.'
                    : activeTab === 'chart'
                        ? 'Explore forward-looking scenarios and projection experiments.'
                        : 'Your trading operating system for review, risk, and momentum.'
        )
        : 'Focused workspace for analysis, review, and execution.';
    const hasActiveFilters =
        (accountNumbers?.length || 0) > 0 ||
        (instruments?.length || 0) > 0 ||
        Boolean(dateRange && (dateRange.from || dateRange.to)) ||
        Boolean(pnlRange && (pnlRange.min !== undefined || pnlRange.max !== undefined)) ||
        (tagFilter?.tags?.length || 0) > 0 ||
        Boolean(weekdayFilter?.days && weekdayFilter.days.length > 0);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full shrink-0 px-3 pb-2 pt-3 transition-all duration-300 sm:px-4 sm:pb-3 sm:pt-4',
                isMobile && 'pt-[calc(env(safe-area-inset-top)+0.75rem)]'
            )}
            data-dashboard-header="true"
        >
            <div className="relative mx-auto max-w-[1800px]">
                <div className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+0.9rem)] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_right,rgba(16,185,129,0.08),transparent_30%)] opacity-80" />
                <div className="qe-v2-card relative flex min-h-[4.4rem] items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-4">
                    <div className="relative z-10 flex min-w-0 items-center gap-2.5 pr-3 sm:gap-3 sm:pr-4 pointer-events-auto">
                        <SidebarTrigger className="h-10 w-10 shrink-0 rounded-2xl border border-v2-border/45 bg-v2-bg-surface/78 text-v2-text-secondary shadow-[0_16px_32px_-24px_rgba(8,15,34,0.92)] transition-all duration-200 hover:border-v2-border/70 hover:bg-v2-bg-hover hover:text-v2-text-primary md:h-9 md:w-9" />
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="hidden h-8 w-px bg-gradient-to-b from-v2-border/0 via-v2-border/45 to-v2-border/0 sm:block" />
                            <div className="min-w-0 max-w-[min(32rem,44vw)]">
                                <div className="flex items-center gap-2.5">
                                    {showSectionLabel && (
                                        <span className={cn(
                                            'hidden sm:inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
                                            'border-v2-border/30 bg-v2-bg-surface/80 text-v2-text-secondary',
                                            'backdrop-blur-sm'
                                        )}>
                                            {sectionLabel}
                                        </span>
                                    )}
                                    <h1 className="truncate text-[11px] font-bold tracking-[0.14em] text-v2-text-primary sm:text-sm sm:uppercase sm:tracking-[0.18em]">
                                        {title}
                                    </h1>
                                </div>
                                <p className="hidden truncate pt-1 text-xs text-v2-text-secondary/85 xl:block">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex min-w-0 flex-1 items-center justify-end pointer-events-auto">
                        <div className="flex min-w-0 w-full items-center justify-end gap-1">
                            <div className="flex min-w-0 items-center gap-1">
                                <FilterCommandMenu
                                    variant="navbar"
                                    className={cn(
                                        isSidebarCollapsed
                                            ? 'w-[clamp(280px,34vw,460px)]'
                                            : 'w-[clamp(220px,24vw,360px)]'
                                    )}
                                />

                                {!isMobile && <GlobalSyncButton />}

                                {!isMobile && <DailySummaryModal />}
                            </div>

                            <div className="hidden sm:flex items-center gap-1">
                                <ImportButton />

                                {!isPlusUser() && (
                                    <Link href={billingHref}>
                                        <button className={cn(
                                            'group flex h-10 items-center gap-2 rounded-full border border-v2-border/40 bg-[linear-gradient(135deg,rgba(35,52,87,0.92),rgba(16,24,42,0.9))] px-4',
                                            'text-[10px] font-semibold uppercase tracking-[0.22em] text-v2-text-primary shadow-[0_20px_40px_-30px_rgba(37,99,235,0.86)] transition-all duration-200',
                                            'hover:-translate-y-0.5 hover:border-v2-accent/55 hover:shadow-[0_26px_46px_-28px_rgba(37,99,235,0.8)]',
                                            'active:translate-y-0 active:scale-[0.98]'
                                        )}>
                                            <Sparkles className="h-3.5 w-3.5 text-v2-accent" />
                                            <span>Upgrade</span>
                                        </button>
                                    </Link>
                                )}
                            </div>

                            {!isMobile && isDashboardRoot && isWidgetsTab ? <DashboardHeaderWidgetControls isMobile={isMobile} /> : null}
                        </div>
                    </div>
                </div>
            </div>

            {isMobile && isDashboardRoot && isWidgetsTab ? (
                <div className="relative mx-auto max-w-[1800px] pt-2">
                    <div className="qe-v2-card px-2 py-2 sm:px-3">
                        <DashboardHeaderWidgetControls isMobile={isMobile} />
                    </div>
                </div>
            ) : null}

            {
                hasActiveFilters ? (
                    <div className={cn(
                        'relative mx-auto max-w-[1800px] pt-2'
                    )}>
                        <div className="qe-v2-card px-3 py-2">
                            <ActiveFilterTags showAccountNumbers={true} />
                        </div>
                    </div>
                ) : null
            }
        </header>
    );
}
