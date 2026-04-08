"use client"

import * as React from "react"
import { SUPPORTED_TIMEZONES } from "@/lib/constants/timezones"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"
import {
    Activity,
    BarChart3,
    BookOpen,
    Brain,
    Building2,
    CreditCard,
    Database,
    Globe,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Sparkles,
    TrendingUp,
    Shield,
} from "lucide-react"
import { LeaderboardIcon } from "@/components/icons/svg-icons"

import { useDashboardActions } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { useCurrentLocale } from "@/locales/client"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
    const { refreshAllData } = useDashboardActions()
    const locale = useCurrentLocale()
    const user = useUserStore(state => state.supabaseUser)
    const timezone = useUserStore(state => state.timezone)
    const setTimezone = useUserStore(state => state.setTimezone)
    const resetUser = useUserStore(state => state.resetUser)

    const handleLogout = React.useCallback(async () => {
        resetUser()
        const { signOut } = await import("@/server/auth")
        await signOut()
    }, [resetUser])

    const navItems: UnifiedSidebarItem[] = React.useMemo(() => [
        {
            href: `/${locale}/dashboard`, // Matches widgets by default in our new mapping
            icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
            label: "Dashboard",
            group: "Overview",
            exact: true
        },
        {
            href: `/${locale}/dashboard?tab=table`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Trades",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard?tab=chart`,
            icon: <Sparkles className={NAV_ICON_SIZE} />,
            label: "Chart the Future",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard?tab=accounts`,
            icon: <Activity className={NAV_ICON_SIZE} />,
            label: "Accounts",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <Brain className={NAV_ICON_SIZE} />,
            label: "Trader Profile",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/strategies`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Trade Desk",
            group: "Trading"
        },
        {
            href: `/${locale}/dashboard/reports`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Reports",
            group: "Analytics"
        },
        {
            href: `/${locale}/dashboard/behavior`,
            icon: <Brain className={NAV_ICON_SIZE} />,
            label: "Behavior",
            group: "Analytics"
        },
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Building2 className={NAV_ICON_SIZE} />,
            label: "Team",
            group: "Community"
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Globe className={NAV_ICON_SIZE} />,
            label: "Prop Firms",
            group: "Community"
        },
        {
            href: `/${locale}/deals`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Deals",
            group: "Community"
        },
        {
            href: `/${locale}/leaderboard`,
            icon: <LeaderboardIcon size={20} />,
            label: "Leaderboard",
            group: "Community"
        },
        {
            href: `/${locale}/dashboard/data`,
            icon: <Database className={NAV_ICON_SIZE} />,
            label: "Data",
            group: "System"
        },
        {
            label: "Sync",
            icon: <RefreshCw className={NAV_ICON_SIZE} />,
            action: () => refreshAllData({ force: true }),
            group: "System"
        },
        {
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className={NAV_ICON_SIZE} />,
            label: "Billing",
            group: "System"
        },
        {
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className={NAV_ICON_SIZE} />,
            label: "Settings",
            group: "System"
        },
        ...(isAdmin ? [{
            href: `/${locale}/admin`,
            icon: <Shield className={NAV_ICON_SIZE} />,
            label: "Admin",
            group: "System"
        }] : []),
    ], [locale, refreshAllData, isAdmin])

    const timezones = [...SUPPORTED_TIMEZONES]

    return (
        <UnifiedSidebar
            items={navItems}
            user={{
                avatar_url: user?.user_metadata?.avatar_url,
                email: user?.email,
                full_name: user?.user_metadata?.full_name
            }}
            styleVariant="minimal"
            timezone={{
                value: timezone,
                options: timezones,
                onChange: setTimezone
            }}
            onLogout={handleLogout}
        />
    )
}
