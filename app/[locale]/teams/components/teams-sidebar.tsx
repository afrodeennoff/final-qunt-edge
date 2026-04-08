"use client"

import { LayoutDashboard, Users, BarChart3, TrendingUp, Globe, ArrowLeft } from "lucide-react"
import { useUserStore } from "@/store/user-store"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { usePathname } from "next/navigation"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"
import { SUPPORTED_TIMEZONES } from "@/lib/constants/timezones"
import { stripLocalePrefix } from "@/components/ui/sidebar-primitives/use-sidebar-nav"

function resolveTeamPathContext(pathname: string) {
  const stripped = stripLocalePrefix(pathname)
  const hasTeamsPrefix = stripped.startsWith('/teams')
  const localePrefix = hasTeamsPrefix && pathname.length > stripped.length
    ? pathname.slice(0, pathname.length - stripped.length)
    : ''
  const teamsRoot = `${localePrefix}/teams`
  const dashboardRoot = `${teamsRoot}/dashboard`

  const segments = stripped.split('/').filter(Boolean)
  const teamsIndex = segments.indexOf('teams')
  const slug =
    hasTeamsPrefix &&
    teamsIndex !== -1 &&
    segments[teamsIndex + 1] === 'dashboard' &&
    segments[teamsIndex + 2] &&
    segments[teamsIndex + 2] !== 'trader'
      ? segments[teamsIndex + 2]
      : undefined

  return { localePrefix, teamsRoot, dashboardRoot, slug }
}

export function TeamsSidebar() {
  const user = useUserStore(state => state.supabaseUser)
  const timezone = useUserStore(state => state.timezone)
  const setTimezone = useUserStore(state => state.setTimezone)
  const pathname = usePathname()
  const { localePrefix, teamsRoot, dashboardRoot, slug } = resolveTeamPathContext(pathname)

  const navItems: UnifiedSidebarItem[] = [
    {
      href: slug ? `${dashboardRoot}/${slug}` : dashboardRoot,
      icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
      label: "Overview",
      group: "Team Overview",
      exact: true
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/analytics` : dashboardRoot,
      icon: <BarChart3 className={NAV_ICON_SIZE} />,
      label: "Analytics",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/traders` : dashboardRoot,
      icon: <TrendingUp className={NAV_ICON_SIZE} />,
      label: "Traders",
      group: "Team Overview",
      disabled: !slug
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/members` : `${teamsRoot}/manage`,
      icon: <Users className={NAV_ICON_SIZE} />,
      label: "Members & Roles",
      group: "Management"
    },
    {
      href: `${localePrefix}/propfirms`,
      icon: <Globe className={NAV_ICON_SIZE} />,
      label: "Prop Firms",
      group: "Resources"
    },
    {
      href: `${localePrefix}/deals`,
      icon: <Globe className={NAV_ICON_SIZE} />,
      label: "Deals",
      group: "Resources"
    },
    {
      href: `${localePrefix}/dashboard`,
      icon: <ArrowLeft className={NAV_ICON_SIZE} />,
      label: "Main Dashboard",
      group: "System"
    },
  ]

  const timezones = [...SUPPORTED_TIMEZONES]

  const resetUser = useUserStore(state => state.resetUser)

  const handleLogout = async () => {
    resetUser()
    const { signOut } = await import("@/server/auth")
    await signOut()
  }

  return (
    <UnifiedSidebar
      items={navItems}
      user={{
        avatar_url: user?.user_metadata?.avatar_url,
        email: user?.email,
        full_name: user?.user_metadata?.full_name
      }}
      showSubscription={false}
      timezone={{
        value: timezone,
        options: timezones,
        onChange: setTimezone
      }}
      onLogout={handleLogout}
    />
  )
}
