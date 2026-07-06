"use client"

import { LayoutDashboard, Users, BarChart3, TrendingUp, Globe, ArrowLeftFromLine, User, BadgePercent } from "lucide-react"
import { useUserStore } from "@/store/user-store"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { usePathname } from "next/navigation"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"
import { SUPPORTED_TIMEZONES } from "@/lib/constants/timezones"
import { stripLocalePrefix } from "@/components/ui/sidebar-primitives/use-sidebar-nav"
import { useEffect, useState } from "react"

function resolveTeamPathContext(pathname: string) {
	const stripped = stripLocalePrefix(pathname)
	const hasTeamsPrefix = stripped.startsWith('/teams')
	const localePrefix = hasTeamsPrefix && pathname.length > stripped.length
	? pathname.slice(0, pathname.length - stripped.length)
	: ''

	const segments = stripped.split('/').filter(Boolean)
	const teamsIndex = segments.indexOf('teams')

	let slug: string | undefined

	if (hasTeamsPrefix && teamsIndex !== -1) {
		const afterDashboard = segments[teamsIndex + 2]
		if (afterDashboard === 'trader') {
			// On trader detail page — try stored team slug
			slug = undefined
		} else if (afterDashboard) {
			slug = afterDashboard
		}
	}

	return { localePrefix, slug }
}

export function TeamsSidebar() {
	const user = useUserStore(state => state.supabaseUser)
	const timezone = useUserStore(state => state.timezone)
	const setTimezone = useUserStore(state => state.setTimezone)
	const pathname = usePathname()
	const { localePrefix, slug } = resolveTeamPathContext(pathname)
	const [storedSlug, setStoredSlug] = useState<string | null>(null)

	useEffect(() => {
		if (slug) {
			localStorage.setItem('lastTeamSlug', slug)
		}
	}, [slug])

	useEffect(() => {
		if (!slug) {
			const saved = localStorage.getItem('lastTeamSlug')
			if (saved) setStoredSlug(saved)
		}
	}, [slug])

	const effectiveSlug = slug || storedSlug || undefined

	const teamsRoot = `${localePrefix}/teams`
	const dashboardRoot = `${teamsRoot}/dashboard`

	const navItems: UnifiedSidebarItem[] = [
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}` : `${teamsRoot}/manage`,
			icon: <LayoutDashboard className={NAV_ICON_SIZE} />,
			label:"Command",
			group:"Team Workspace",
			exact: !!effectiveSlug,
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/analytics` : `${teamsRoot}/manage`,
			icon: <BarChart3 className={NAV_ICON_SIZE} />,
			label:"Insights",
			group:"Team Workspace",
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/traders` : `${teamsRoot}/manage`,
			icon: <TrendingUp className={NAV_ICON_SIZE} />,
			label:"Roster",
			group:"Team Workspace",
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/members` : `${teamsRoot}/manage`,
			icon: <Users className={NAV_ICON_SIZE} />,
			label:"Access",
			group:"Team Workspace",
		},
		{
			href: `${teamsRoot}/manage`,
			icon: <ArrowLeftFromLine className={NAV_ICON_SIZE} />,
			label:"Manage Teams",
			group:"Management",
		},
		{
			href: `${localePrefix}/propfirms`,
			icon: <Globe className={NAV_ICON_SIZE} />,
			label:"Prop Firms",
			group:"Resources",
		},
		{
			href: `${localePrefix}/deals`,
			icon: <BadgePercent className={NAV_ICON_SIZE} />,
			label:"Deals",
			group:"Resources",
		},
		{
			href: `${localePrefix}/dashboard`,
			icon: <User className={NAV_ICON_SIZE} />,
			label:"Personal Workspace",
			group:"System",
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
