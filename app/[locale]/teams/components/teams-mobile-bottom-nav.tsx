'use client'

import { LayoutDashboard, BarChart3, TrendingUp, ArrowLeft } from 'lucide-react'
import { MobileBottomNav, type MobileNavItem } from '@/components/mobile-bottom-nav'

interface TeamsMobileBottomNavProps {
<<<<<<< HEAD
 dashboardRoot: string
 slug: string | undefined
 backHref: string
}

export function TeamsMobileBottomNav({ dashboardRoot, slug, backHref }: TeamsMobileBottomNavProps) {
 const items: MobileNavItem[] = [
 {
 href: slug ? `${dashboardRoot}/${slug}` : dashboardRoot,
 icon: LayoutDashboard,
 label: 'Overview',
 exact: true,
 },
 {
 href: slug ? `${dashboardRoot}/${slug}/analytics` : dashboardRoot,
 icon: BarChart3,
 label: 'Analytics',
 disabled: !slug,
 },
 {
 href: slug ? `${dashboardRoot}/${slug}/traders` : dashboardRoot,
 icon: TrendingUp,
 label: 'Traders',
 disabled: !slug,
 },
 {
 href: backHref,
 icon: ArrowLeft,
 label: 'Dashboard',
 },
 ]

 return <MobileBottomNav items={items} />
=======
  dashboardRoot: string
  slug: string | undefined
  backHref: string
}

export function TeamsMobileBottomNav({ dashboardRoot, slug, backHref }: TeamsMobileBottomNavProps) {
  const items: MobileNavItem[] = [
    {
      href: slug ? `${dashboardRoot}/${slug}` : dashboardRoot,
      icon: LayoutDashboard,
      label: 'Overview',
      exact: true,
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/analytics` : dashboardRoot,
      icon: BarChart3,
      label: 'Analytics',
      disabled: !slug,
    },
    {
      href: slug ? `${dashboardRoot}/${slug}/traders` : dashboardRoot,
      icon: TrendingUp,
      label: 'Traders',
      disabled: !slug,
    },
    {
      href: backHref,
      icon: ArrowLeft,
      label: 'Dashboard',
    },
  ]

  return <MobileBottomNav items={items} />
>>>>>>> origin/main
}
