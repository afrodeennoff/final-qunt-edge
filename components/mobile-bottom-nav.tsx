'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, Settings, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCurrentLocale } from '@/locales/client'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
}

function useNavItems(): NavItem[] {
  const locale = useCurrentLocale()
  return React.useMemo(
    () => [
      {
        href: `/${locale}/dashboard`,
        icon: LayoutDashboard,
        label: 'Dashboard',
        exact: true,
      },
      {
        href: `/${locale}/dashboard?tab=table`,
        icon: TrendingUp,
        label: 'Trades',
      },
      {
        href: `/${locale}/dashboard?tab=accounts`,
        icon: Activity,
        label: 'Accounts',
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

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href.split('?')[0]
  }
  return pathname === item.href.split('?')[0]
}

function MobileBottomNav() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const items = useNavItems()

  if (!isMobile) return null

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 md:hidden',
        'border-t border-border/50',
        'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className='flex h-16 items-center justify-around px-2 pb-safe'>
        {items.map((item) => {
          const active = isActive(pathname, item)
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              <Icon
                className={cn(
                  'size-5 transition-colors duration-200',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none transition-colors duration-200',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { MobileBottomNav }
