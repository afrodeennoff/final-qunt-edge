
"use client"

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
    const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i);
    const billingHref = localeMatch?.[1] ? `/${localeMatch[1]}/dashboard/billing` : '/dashboard/billing';

    const getTitle = () => {
        if (isDashboardRoot) {
            if (activeTab === 'table') return 'Trades';
            if (activeTab === 'accounts') return 'Accounts';
            if (activeTab === 'chart') return 'Chart the Future';
            return 'Overview';
        }
        if (pathname.includes('strategies')) return 'Trade Desk';
        if (pathname.includes('reports')) return 'Analytics';
        if (pathname.includes('behavior')) return 'Behavior';
        if (pathname.includes('trader-profile')) return 'Trader Profile';
        if (pathname.includes('calendar')) return 'Calendar';
        if (pathname.includes('data')) return 'Data';
        if (pathname.includes('settings')) return 'Settings';
        if (pathname.includes('billing')) return 'Billing';
        return 'Dashboard';
    };

    const title = getTitle();
    const sectionLabel = isDashboardRoot ? "Workspace" : "Dashboard";
    const showSectionLabel = !(isDashboardRoot && activeTab === 'accounts');
    const subtitle = isDashboardRoot
        ? (
            activeTab === 'table'
                ? 'Review execution details, filters, and performance by trade.'
                : activeTab === 'accounts'
                    ? 'Track account growth, balances, and consistency in one place.'
                    : activeTab === 'chart'
                        ? 'Explore scenario planning and forward-looking projections.'
                        : 'Customize your layout and monitor your most important metrics.'
        )
        : 'Focus mode for analysis, execution, and daily workflow.';
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
                "sticky top-0 z-50 overflow-hidden border-b backdrop-blur-xl transition-all duration-300",
                "border-v2-border/40 bg-v2-bg-base/95",
                "supports-[backdrop-filter]:bg-v2-bg-base/85 supports-[backdrop-filter]:backdrop-blur-xl",
                isMobile ? "pt-safe" : "h-14"
            )}
            data-dashboard-header="true"
        >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--foreground) / 0.12),transparent_25%,transparent_75%,hsl(var(--foreground) / 0.12))]" />
            <div className={cn("relative flex items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6", isMobile ? "h-14" : "h-full")}>
                <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-3 pointer-events-auto">
                    <SidebarTrigger className="h-10 w-10 md:h-7 md:w-7 text-v2-text-muted hover:text-v2-text-primary transition-colors" />
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="mt-0.5 hidden h-7 w-px bg-v2-border/30 sm:block" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                {showSectionLabel && (
                                    <span className={cn(
                                        "hidden sm:inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                        "border-v2-border/40 bg-v2-bg-surface/40 text-v2-text-muted",
                                        "backdrop-blur-sm transition-all duration-200",
                                        "hover:border-v2-border/60 hover:bg-v2-bg-surface/60"
                                    )}>
                                        {sectionLabel}
                                    </span>
                                )}
                                <h1 className="truncate text-[10px] font-bold tracking-[0.12em] text-v2-text-primary sm:text-sm sm:uppercase sm:tracking-[0.16em]">
                                    {title}
                                </h1>
                            </div>
                            <p className="hidden truncate pt-1 text-xs text-v2-text-secondary lg:block">{subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "flex shrink-0 items-center gap-1.5 sm:gap-2",
                    isMobile
                        ? "rounded-lg border border-v2-border/30 bg-v2-bg-surface/45 p-0.5 shadow-none"
                        : cn(
                            "rounded-2xl border p-1 shadow-sm transition-all duration-200",
                            "border-v2-border/40 bg-v2-bg-surface/30 backdrop-blur-sm",
                            "hover:border-v2-border/60 hover:bg-v2-bg-surface/40 hover:shadow-md"
                        )
                )}>
                    <div className={cn(
                        "flex shrink-0 items-center gap-1",
                        isMobile ? "" : cn(
                            "rounded-xl bg-v2-bg-base/60 px-1 py-0.5 ring-1",
                            "ring-v2-border/10 transition-all duration-200",
                            "hover:ring-v2-border/20 hover:bg-v2-bg-base/80"
                        )
                    )}>
                        <FilterCommandMenu variant="navbar" />

                        {!isMobile && <GlobalSyncButton />}

                        {!isMobile && <DailySummaryModal />}
                    </div>

                    <div className="h-6 w-px bg-v2-border/30 mx-1 hidden sm:block" />

                    <div className="hidden sm:flex items-center gap-2">
                        <ImportButton />

                        {!isPlusUser() && (
                            <Link href={billingHref}>
                                <button className={cn(
                                    "group flex h-8 items-center gap-2 rounded-lg border bg-v2-bg-surface px-4",
                                    "text-[9px] font-bold uppercase tracking-[0.2em] text-v2-text-primary",
                                    "border-v2-border/60 transition-all duration-200",
                                    "hover:bg-v2-accent/10 hover:border-v2-accent/50 hover:shadow-[var(--v2-glow-ambient)]",
                                    "active:scale-95"
                                )}>
                                    <Sparkles className="h-3 w-3 animate-pulse text-v2-accent" />
                                    <span>UPGRADE</span>
                                </button>
                            </Link>
                        )}
                    </div>

                    {!isMobile && isDashboardRoot && isWidgetsTab ? <DashboardHeaderWidgetControls isMobile={isMobile} /> : null}
                </div>
            </div>

            {isMobile && isDashboardRoot && isWidgetsTab ? (
                <div className="relative px-3 pb-2 pt-1">
                    <DashboardHeaderWidgetControls isMobile={isMobile} />
                </div>
            ) : null}

            {
                isMobile ? (
                    hasActiveFilters && (
                        <div className="relative px-3 pb-3 pt-1">
                            <div className={cn(
                                "rounded-xl border px-2 py-1.5 backdrop-blur-sm transition-all duration-200",
                                "border-v2-border/60 bg-v2-bg-surface/60"
                            )}>
                                <ActiveFilterTags showAccountNumbers={true} />
                            </div>
                        </div>
                    )
                ) : (
                    hasActiveFilters && (
                        <div className="relative px-4 pb-3 pt-1 sm:px-8">
                            <div className={cn(
                                "rounded-xl border px-2 py-1.5 backdrop-blur-sm transition-all duration-200",
                                "border-v2-border/60 bg-v2-bg-surface/60"
                            )}>
                                <ActiveFilterTags showAccountNumbers={true} />
                            </div>
                        </div>
                    )
                )
            }
        </header>
    );
}
