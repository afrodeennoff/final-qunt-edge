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
    const prismaUser = useUserStore(state => state.user)
    const timezone = useUserStore(state => state.timezone)
    const setTimezone = useUserStore(state => state.setTimezone)
    const resetUser = useUserStore(state => state.resetUser)

    const handleLogout = React.useCallback(async () => {
        resetUser()
        const { signOut } = await import("@/server/auth")
        await signOut()
    }, [resetUser])

    const navItems: UnifiedSidebarItem[] = React.useMemo(() => [
        // ── Workspace ──
        {
            href: `/${locale}/dashboard`,
            icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
            label: "Overview",
            group: "Workspace",
            exact: true
        },
        {
            href: `/${locale}/dashboard/trades`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Trades",
            group: "Workspace"
        },
        {
            href: `/${locale}/dashboard/notes`,
            icon: <FileText className={NAV_ICON_SIZE} />,
            label: "Journal",
            group: "Workspace"
        },
        {
            href: `/${locale}/dashboard/accounts`,
            icon: <Activity className={NAV_ICON_SIZE} />,
            label: "Accounts",
            group: "Workspace"
        },

        // ── Review ──
        {
            href: `/${locale}/dashboard/analytics`,
            icon: <Sparkles className={NAV_ICON_SIZE} />,
            label: "Copilot",
            group: "Review"
        },
        {
            href: `/${locale}/dashboard/analytics/statistics`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Statistics",
            group: "Review"
        },
        // ── Tools ──
        {
            href: `/${locale}/dashboard/import`,
            icon: <FileUp className={NAV_ICON_SIZE} />,
            label: "Import",
            group: "Tools"
        },
        {
            href: `/${locale}/dashboard/data`,
            icon: <Database className={NAV_ICON_SIZE} />,
            label: "Data",
            group: "Tools"
        },
        {
            label: "Sync",
            icon: <RefreshCw className={NAV_ICON_SIZE} />,
            action: () => refreshAllData({ force: true }),
            group: "Tools"
        },

        // ── Profile ──
        {
            href: `/${locale}/dashboard/trader-profile`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Profile",
            group: "Profile"
        },
        {
            href: `/${locale}/teams/dashboard`,
            icon: <Users className={NAV_ICON_SIZE} />,
            label: "Teams",
            group: "Profile"
        },
        {
            href: `/${locale}/dashboard/billing`,
            icon: <CreditCard className={NAV_ICON_SIZE} />,
            label: "Billing",
            group: "Profile"
        },
        {
            href: `/${locale}/dashboard/settings`,
            icon: <Settings className={NAV_ICON_SIZE} />,
            label: "Settings",
            group: "Profile"
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
        {
            href: `/${locale}/docs`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Docs",
            group: "Resources"
        },

        // ── System ──
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
                full_name: user?.user_metadata?.full_name,
                username: prismaUser?.username,
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
