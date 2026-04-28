"use client"

import * as React from "react"
import { SUPPORTED_TIMEZONES } from "@/lib/constants/timezones"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"
import {
    Activity,
    BarChart3,
    BookOpen,
    Building2,
    CreditCard,
    Database,
    FileUp,
    FileText,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Sparkles,
    TrendingUp,
    Shield,
    Users,
    Compass,
    DollarSign,
} from "lucide-react"

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
        // ── Trade Desk ──
        {
            href: `/${locale}/dashboard`,
            icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
            label: "Overview",
            group: "Trade Desk",
            exact: true
        },
        {
            href: `/${locale}/dashboard/import`,
            icon: <FileUp className={NAV_ICON_SIZE} />,
            label: "Import Trades",
            group: "Trade Desk"
        },
        {
            href: `/${locale}/dashboard/trades`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Trade Log",
            group: "Trade Desk"
        },
        {
            href: `/${locale}/dashboard/accounts`,
            icon: <Activity className={NAV_ICON_SIZE} />,
            label: "Accounts",
            group: "Trade Desk"
        },

        // ── Review ──
        {
            href: `/${locale}/dashboard/notes`,
            icon: <FileText className={NAV_ICON_SIZE} />,
            label: "Notes",
            group: "Review"
        },
        {
            href: `/${locale}/dashboard/behavior`,
            icon: <Sparkles className={NAV_ICON_SIZE} />,
            label: "Behavior",
            group: "Review"
        },
        {
            href: `/${locale}/dashboard/reports`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Reports",
            group: "Review"
        },
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Trader Profile",
            group: "Review"
        },

        // ── Edge Lab ──
        {
            href: `/${locale}/dashboard/analytics`,
            icon: <Compass className={NAV_ICON_SIZE} />,
            label: "Scenario Lab",
            group: "Edge Lab"
        },
        {
            href: `/${locale}/dashboard/strategies`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Playbook",
            group: "Edge Lab"
        },
        {
            href: `/${locale}/dashboard/data`,
            icon: <Database className={NAV_ICON_SIZE} />,
            label: "Data",
            group: "Edge Lab"
        },

        // ── Growth ──
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Users className={NAV_ICON_SIZE} />,
            label: "Teams",
            group: "Growth"
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Building2 className={NAV_ICON_SIZE} />,
            label: "Prop Firms",
            group: "Growth"
        },
        {
            href: `/${locale}/deals`,
            icon: <DollarSign className={NAV_ICON_SIZE} />,
            label: "Deals",
            group: "Growth"
        },

        // ── System ──
        {
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className={NAV_ICON_SIZE} />,
            label: "Settings",
            group: "System"
        },
        {
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className={NAV_ICON_SIZE} />,
            label: "Billing",
            group: "System"
        },
        {
            label: "Sync",
            icon: <RefreshCw className={NAV_ICON_SIZE} />,
            action: () => refreshAllData({ force: true }),
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
