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
            label: "Home",
            group: "Workspace",
            exact: true
        },
        {
            href: `/${locale}/dashboard?tab=table`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Journal",
            group: "Workspace"
        },
        {
            href: `/${locale}/dashboard?tab=chart`,
            icon: <Sparkles className={NAV_ICON_SIZE} />,
            label: "Scenario Lab",
            group: "Workspace"
        },
        {
            href: `/${locale}/dashboard?tab=accounts`,
            icon: <Activity className={NAV_ICON_SIZE} />,
            label: "Accounts",
            group: "Workspace"
        },
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <Brain className={NAV_ICON_SIZE} />,
            label: "Profile",
            group: "Performance"
        },
        {
            href: `/${locale}/dashboard/strategies`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Playbook",
            group: "Performance"
        },
        {
            href: `/${locale}/dashboard/reports`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Analytics",
            group: "Performance"
        },
        {
            href: `/${locale}/dashboard/behavior`,
            icon: <Brain className={NAV_ICON_SIZE} />,
            label: "Coaching",
            group: "Performance"
        },
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Building2 className={NAV_ICON_SIZE} />,
            label: "Team",
            group: "Network"
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Globe className={NAV_ICON_SIZE} />,
            label: "Prop Firms",
            group: "Network"
        },
        {
            href: `/${locale}/deals`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Deals",
            group: "Network"
        },
        {
            href: `/${locale}/leaderboard`,
            icon: <LeaderboardIcon size={20} />,
            label: "Leaderboard",
            group: "Network"
        },
        {
            href: `/${locale}/dashboard/data`,
            icon: <Database className={NAV_ICON_SIZE} />,
            label: "Data",
            group: "Control"
        },
        {
            label: "Sync",
            icon: <RefreshCw className={NAV_ICON_SIZE} />,
            action: () => refreshAllData({ force: true }),
            group: "Control"
        },
        {
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className={NAV_ICON_SIZE} />,
            label: "Billing",
            group: "Control"
        },
        {
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className={NAV_ICON_SIZE} />,
            label: "Settings",
            group: "Control"
        },
        ...(isAdmin ? [{
            href: `/${locale}/admin`,
            icon: <Shield className={NAV_ICON_SIZE} />,
            label: "Admin",
            group: "Control"
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
