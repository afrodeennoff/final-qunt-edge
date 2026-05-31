'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen, LayoutDashboard, FileText, BarChart3, Sparkles, Activity, FileUp, Settings,
} from 'lucide-react'

const SECTIONS = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs', icon: BookOpen, exact: true },
      { title: 'Quick Start', href: '/docs/getting-started', icon: BookOpen },
    ],
  },
  {
    group: 'Core Features',
    items: [
      { title: 'Dashboard', href: '/docs/dashboard', icon: LayoutDashboard },
      { title: 'Trade Log', href: '/docs/trade-log', icon: FileText },
      { title: 'Trade Journal', href: '/docs/journal', icon: FileText },
      { title: 'Statistics', href: '/docs/statistics', icon: BarChart3 },
      { title: 'Analytics & Copilot', href: '/docs/analytics', icon: Sparkles },
      { title: 'Accounts', href: '/docs/accounts', icon: Activity },
      { title: 'Data Import', href: '/docs/import', icon: FileUp },
      { title: 'Settings & Profile', href: '/docs/settings', icon: Settings },
    ],
  },
]

export function DocsSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const normalized = pathname.replace(/\/+$/, '') || '/'

  const isActive = (href: string, exact?: boolean) => {
    const full = `/${locale}${href}`
    return exact ? normalized === full : normalized.startsWith(full)
  }

  return (
    <nav className="sticky top-24 space-y-6">
      {SECTIONS.map(section => (
        <div key={section.group}>
          <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {section.group}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.href}>
                <Link
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
