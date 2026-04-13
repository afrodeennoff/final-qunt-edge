'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Activity, LayoutDashboard, Settings, Sparkles, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCurrentLocale } from '@/locales/client'

export interface MobileNavItem {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
  tab?: string
  disabled?: boolean
}

function useNavItems(): MobileNavItem[] {
  const locale = useCurrentLocale()
  return React.useMemo(
    () => [
      {
        href: `/${locale}/dashboard`,
        icon: LayoutDashboard,
        label: 'Home',
        tab: 'widgets',
        exact: true,
      },
      {
        href: `/${locale}/dashboard?tab=table`,
        icon: TrendingUp,
        label: 'Journal',
        tab: 'table',
      },
      {
        href: `/${locale}/dashboard?tab=chart`,
        icon: Sparkles,
        label: 'Lab',
        tab: 'chart',
      },
      {
        href: `/${locale}/dashboard?tab=accounts`,
        icon: Activity,
        label: 'Accounts',
        tab: 'accounts',
      },
      {
        href: `/${locale}/dashboard/settings`,
        icon: Settings,
        label: 'Settings',
      },
    ],
    [locale]
  )
}

function useIsActive(item: MobileNavItem): boolean {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Derive basePath from item's href (strip query params)
  const basePath = item.href.split('?')[0]

  // Check if we're on the base path of this item
  const isOnBasePath = pathname === basePath

  if (item.tab) {
    const activeTab = searchParams.get('tab') || 'widgets'
    return isOnBasePath && activeTab === item.tab
  }

  if (item.exact) {
    return isOnBasePath && (!searchParams.get('tab') || searchParams.get('tab') === 'widgets')
  }

  // For items without tab/exact, match exact pathname
  return pathname === item.href
}

function TabItem({ item }: { item: MobileNavItem }) {
  const active = useIsActive(item)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'relative group flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[48px] rounded-2xl py-1.5 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'size-5 transition-all duration-200',
          active ? 'scale-110 text-sidebar-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78'
        )}
      />
      <span
        className={cn(
          'text-[10px] font-medium leading-tight transition-colors duration-200',
          active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78'
        )}
      >
        {item.label}
      </span>
      {active && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_0_0_0.5px_oklch(0.65_0.22_260/0.18),0_18px_32px_-24px_rgba(37,99,235,0.6)]" />
          <div className="absolute left-1/2 top-1.5 h-[2px] w-6 -translate-x-1/2 rounded-full bg-sidebar-primary shadow-[0_0_14px_oklch(0.65_0.22_260/0.55)]" />
        </>
      )}
    </Link>
  )
}

function MobileBottomNav({ items }: { items?: MobileNavItem[] }) {
  const isMobile = useIsMobile()
  const defaultItems = useNavItems()
  const navItems = (items ?? defaultItems).filter(item => !item.disabled)

  if (!isMobile) return null

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 md:hidden',
        'px-3 pb-safe'
      )}
      aria-label="Dashboard navigation"
    >
      <div className="flex h-[4.35rem] items-center justify-around rounded-[2rem] border border-white/[0.08] bg-black/75 px-2 shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_18px_40px_-24px_rgba(0,0,0,0.88)]">
        {navItems.map((item) => (
          <TabItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  )
}

export { MobileBottomNav }
