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

  return pathname === item.href
}

function TabItem({ item }: { item: MobileNavItem }) {
  const active = useIsActive(item)
  const Icon = item.icon
  const touchFeedback = React.useRef<HTMLAnchorElement>(null)

  const handleClick = React.useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(6)
    }
  }, [])

  return (
    <Link
      ref={touchFeedback}
      href={item.href}
      onClick={handleClick}
      className={cn(
        'relative group flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[52px] rounded-2xl py-1.5',
        'transition-[opacity,background-color,border-color,transform] duration-150',
        'active:scale-95',
        'touch-manipulation select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'size-5 transition-[opacity,background-color,border-color,transform] duration-150',
          active ? 'scale-110 text-sidebar-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78'
        )}
      />
      <span
        className={cn(
          'text-[10px] font-medium leading-tight transition-colors duration-150',
          active
            ? 'text-sidebar-foreground'
            : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/78',
        )}
      >
        {item.label}
      </span>
      {active && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-sidebar-primary/90 bg-sidebar-primary/10 shadow-[inset_0_1px_0_hsl(var(--sidebar-primary)/0.08),0_0_0_0.5px_hsl(var(--sidebar-primary)/0.22),0_18px_32px_-24px_hsl(var(--sidebar-primary)/0.45)]" />
          <div className="absolute left-1/2 top-1.5 h-[2px] w-6 -translate-x-1/2 rounded-full bg-sidebar-primary shadow-[0_0_14px_hsl(var(--sidebar-primary)/0.45)]" />
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
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 md:hidden',
        'px-3 pb-safe mobile-landscape-compact',
        'animate-in slide-in-from-bottom duration-300 ease-out'
      )}
      aria-label="Dashboard navigation"
    >
      <div
        className="relative flex h-[4.35rem] items-center justify-around rounded-2xl border border-sidebar-border/30 bg-background/95 px-2 shadow-[inset_0_1px_0_hsl(var(--primary)/0.04),0_18px_40px_-24px_rgba(0,0,0,0.84)]"
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)', willChange: 'transform' }}
      >
        {navItems.map((item) => (
          <TabItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  )
}

export { MobileBottomNav }
