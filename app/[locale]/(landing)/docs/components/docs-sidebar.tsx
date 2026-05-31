'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen, LayoutDashboard, FileText, BarChart3, Sparkles, Activity, FileUp, Settings,
  ChevronLeft, ChevronRight
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
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem('qunt-docs-sidebar-collapsed')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('qunt-docs-sidebar-collapsed', String(next))
  }

  const isActive = (href: string, exact?: boolean) => {
    const full = `/${locale}${href}`
    return exact ? normalized === full : normalized.startsWith(full)
  }

  // Desktop collapsible version
  return (
    <nav className={cn("sticky top-24 space-y-6 transition-all", collapsed ? "w-14" : "w-56")}>
      <div className="flex items-center justify-between px-3">
        {!collapsed && (
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Documentation</h3>
        )}
        <button
          onClick={toggle}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {SECTIONS.map(section => (
        <div key={section.group}>
          {!collapsed && (
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.group}
            </h3>
          )}
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
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {!collapsed && item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Future: Mobile sheet trigger can be added in layout if desired */}
    </nav>
  )
}
