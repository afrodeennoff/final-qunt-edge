'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, Settings, Sparkles, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCurrentLocale } from '@/locales/client'

export interface MobileNavItem {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
  disabled?: boolean
}

function useNavItems(): MobileNavItem[] {
  const locale = useCurrentLocale()
  return React.useMemo(
    () => [
      {
        href: `/${locale}/dashboard`,
        icon: LayoutDashboard,
        label: 'Overview',
        exact: true,
      },
      {
        href: `/${locale}/dashboard/trades`,
        icon: TrendingUp,
        label: 'Trades',
      },
      {
        href: `/${locale}/dashboard/analytics`,
        icon: Sparkles,
        label: 'Lab',
      },
      {
        href: `/${locale}/dashboard/accounts`,
        icon: Activity,
        label: 'Accounts',
      },
      {
        href: `/${locale}/dashboard/settings`,
        icon: Settings,
        label: 'Settings',
      },
    ],
    [locale],
  )
}

function useIsActive(item: MobileNavItem): boolean {
  const pathname = usePathname()

  if (item.exact) {
    return pathname === item.href
  }

  // For items without exact, match exact pathname
  return pathname === item.href
}

function TabItem({ item }: { item: MobileNavItem }) {
  const active = useIsActive(item)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'relative group flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[48px] rounded-2xl py-1.5 transition-[opacity,background-color,border-color,transform] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'size-5 transition-[opacity,background-color,border-color,transform] duration-200',
          active ? 'scale-110 text-sidebar-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78'
        )}
      />
      <span
        className={cn(
          'text-[10px] font-medium leading-tight transition-colors duration-200',
          active
            ? 'text-sidebar-foreground'
            : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78',
        )}
      >
        {item.label}
      </span>
      {active && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-[oklch(0.2505_0.0293_299.5707/0.9)] bg-[oklch(0.6083_0.2172_297.1153/0.10)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_0.5px_oklch(0.6083_0.2172_297.1153/0.22),0_18px_32px_-24px_oklch(0.4865_0.2423_291.8661/0.45)]" />
          <div className="absolute left-1/2 top-1.5 h-[2px] w-6 -translate-x-1/2 rounded-full bg-sidebar-primary shadow-[0_0_14px_oklch(0.6083_0.2172_297.1153/0.45)]" />
        </>
      )}
    </Link>
  )
}

function MobileBottomNav({ items }: { items?: MobileNavItem[] }) {
  const isMobile = useIsMobile()
  const defaultItems = useNavItems()
  const navItems = (items ?? defaultItems).filter((item) => !item.disabled)

  if (!isMobile) return null

  return (
    <nav
      className={cn('fixed inset-x-0 bottom-0 z-40 md:hidden', 'px-3 pb-safe')}
      aria-label="Dashboard navigation"
    >
      <div className="flex h-[4.35rem] items-center justify-around rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.046_0.008_260_/_0.94)] px-2 shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04),0_18px_40px_-24px_rgba(0,0,0,0.84)]">
        {navItems.map((item) => (
          <TabItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  )
}

export { MobileBottomNav }
