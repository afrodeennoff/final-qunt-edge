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

export function LandingSidebar() {
    const locale = useI18n()

    const navItems = React.useMemo(() => [
        {
            href: `/${locale}/`,
            icon: <Home className="size-4" />,
            label: "Home",
            exact: true,
            group: "Overview",
        },
        {
            href: `/${locale}/propfirms`,
            icon: <Building2 className="size-4" />,
            label: "Prop Firms",
            group: "Explore",
        },
        {
            href: `/${locale}/deals`,
            icon: <TrendingUp className="size-4" />,
            label: "Deals",
            group: "Explore",
        },
        {
            href: `/${locale}/leaderboard`,
            icon: <BarChart3 className="size-4" />,
            label: "Leaderboard",
            group: "Explore",
        },
        {
            href: `/${locale}/pricing`,
            icon: <CreditCard className="size-4" />,
            label: "Pricing",
            group: "Account",
        },
        {
            href: `/${locale}/updates`,
            icon: <BookOpen className="size-4" />,
            label: "Updates",
            group: "Resources",
        },
        {
            href: `/${locale}/community`,
            icon: <Users className="size-4" />,
            label: "Community",
            group: "Resources",
        },
        {
            href: `/${locale}/about`,
            icon: <Globe className="size-4" />,
            label: "About",
            group: "Resources",
        },
        {
            href: `/${locale}/support`,
            icon: <MessageSquare className="size-4" />,
            label: "Support",
            group: "Help",
        },
        {
            href: `/${locale}/settings`,
            icon: <Settings className="size-4" />,
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
