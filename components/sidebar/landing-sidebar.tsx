"use client"

import * as React from "react"
import {
    BarChart3,
    BookOpen,
    Building2,
    CreditCard,
    Globe,
    Home,
    MessageSquare,
    Settings,
    TrendingUp,
    Users,
} from "lucide-react"

import { UnifiedSidebar } from "@/components/ui/unified-sidebar"
import { useI18n } from "@/locales/client"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"

export function LandingSidebar() {
    const locale = useI18n()

    const navItems = React.useMemo(() => [
        {
            href: `/${locale}/`,
            icon: <Home className={NAV_ICON_SIZE} />,
            label: "Home",
            exact: true,
            group: "Overview",
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Building2 className={NAV_ICON_SIZE} />,
            label: "Prop Firms",
            group: "Explore",
        },
        {
            href: `/${locale}/deals`,
            icon: <TrendingUp className={NAV_ICON_SIZE} />,
            label: "Deals",
            group: "Explore",
        },
        {
            href: `/${locale}/leaderboard`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Leaderboard",
            group: "Explore",
        },
        {
            href: `/${locale}/pricing`,
            icon: <CreditCard className={NAV_ICON_SIZE} />,
            label: "Pricing",
            group: "Account",
        },
        {
            href: `/${locale}/updates`,
            icon: <BookOpen className={NAV_ICON_SIZE} />,
            label: "Updates",
            group: "Resources",
        },
        {
            href: `/${locale}/community`,
            icon: <Users className={NAV_ICON_SIZE} />,
            label: "Community",
            group: "Resources",
        },
        {
            href: `/${locale}/about`,
            icon: <Globe className={NAV_ICON_SIZE} />,
            label: "About",
            group: "Resources",
        },
        {
            href: `/${locale}/support`,
            icon: <MessageSquare className={NAV_ICON_SIZE} />,
            label: "Support",
            group: "Help",
        },
        {
            href: `/${locale}/settings`,
            icon: <Settings className={NAV_ICON_SIZE} />,
            label: "Settings",
            group: "Help",
        },
    ], [locale])

    return (
        <UnifiedSidebar
            items={navItems}
        />
    )
}
