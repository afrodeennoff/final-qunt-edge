'use client'

import { LayoutDashboard, BarChart3, TrendingUp, Users, ArrowLeftFromLine } from 'lucide-react'
import { MobileBottomNav, type MobileNavItem } from '@/components/mobile-bottom-nav'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { stripLocalePrefix } from '@/components/ui/sidebar-primitives/use-sidebar-nav'

interface TeamsMobileBottomNavProps {
	slug?: string
}

export function TeamsMobileBottomNav({ slug }: TeamsMobileBottomNavProps) {
	const pathname = usePathname()
	const [storedSlug, setStoredSlug] = useState<string | null>(null)
	const stripped = stripLocalePrefix(pathname)
	const hasLocalePrefix = pathname.length > stripped.length
	const localePrefix = hasLocalePrefix ? pathname.slice(0, pathname.length - stripped.length) : ''
	const teamsRoot = `${localePrefix}/teams`
	const dashboardRoot = `${teamsRoot}/dashboard`

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

	const items: MobileNavItem[] = [
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}` : `${teamsRoot}/manage`,
			icon: LayoutDashboard,
			label: 'Command',
			exact: !!effectiveSlug,
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/analytics` : `${teamsRoot}/manage`,
			icon: BarChart3,
			label: 'Insights',
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/traders` : `${teamsRoot}/manage`,
			icon: TrendingUp,
			label: 'Roster',
		},
		{
			href: effectiveSlug ? `${dashboardRoot}/${effectiveSlug}/members` : `${teamsRoot}/manage`,
			icon: Users,
			label: 'Access',
		},
		{
			href: `${localePrefix}/dashboard`,
			icon: ArrowLeftFromLine,
			label: 'Workspace',
		},
	]

	return <MobileBottomNav items={items} />
}
