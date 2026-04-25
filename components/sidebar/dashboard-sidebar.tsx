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
    FileUp,
    FileText,
    Globe,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Sparkles,
    TrendingUp,
    Shield,
    Users,
    Target,
    Compass,
    DollarSign,
    Trophy,
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
        // ── Overview ──
        {
            href: `/${locale}/dashboard`,
            icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
            label: "Dashboard",
            group: "Overview",
            exact: true
        },
        {
            href: `/${locale}/dashboard?tab=table`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Journal",
            group: "Overview"
        },
        {
            href: `/${locale}/dashboard/notes`,
            icon: <FileText className={NAV_ICON_SIZE} />,
            label: "Notes",
            group: "Overview"
        },
        {
            href: `/${locale}/dashboard?tab=accounts`,
            icon: <Activity className={NAV_ICON_SIZE} />,
            label: "Accounts",
            group: "Overview"
        },

        // ── Analysis ──
        {
            href: `/${locale}/dashboard?tab=chart`,
            icon: <Sparkles className={NAV_ICON_SIZE} />,
            label: "Scenario Lab",
            group: "Analysis"
        },
        {
            href: `/${locale}/dashboard/reports`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Analytics",
            group: "Analysis"
        },
        {
            href: `/${locale}/dashboard/behavior`,
            icon: <Target className={NAV_ICON_SIZE} />,
            label: "Coaching",
            group: "Analysis"
        },
        {
            href: `/${locale}/dashboard/strategies`,
            icon: <Compass className={NAV_ICON_SIZE} />,
            label: "Playbook",
            group: "Analysis"
        },

        // ── Profile & Social ──
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <Brain className={NAV_ICON_SIZE} />,
            label: "Trader Profile",
            group: "Profile & Social"
        },
        {
            href: `/${locale}/leaderboard`,
            icon: <Trophy className={NAV_ICON_SIZE} />,
            label: "Leaderboard",
            group: "Profile & Social"
        },
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Users className={NAV_ICON_SIZE} />,
            label: "Teams",
            group: "Profile & Social"
        },

        // ── Resources ──
        {
            href: `/${locale}/propfirms`,
            icon: <Building2 className={NAV_ICON_SIZE} />,
            label: "Prop Firms",
            group: "Resources"
        },
        {
            href: `/${locale}/deals`,
            icon: <DollarSign className={NAV_ICON_SIZE} />,
            label: "Deals",
            group: "Resources"
        },

        // ── System ──
        {
            href: `/${locale}/dashboard/import`,
            icon: <FileUp className={NAV_ICON_SIZE} />,
            label: "Import",
            group: "System"
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
