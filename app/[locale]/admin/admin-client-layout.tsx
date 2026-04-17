'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SidebarNav } from './components/sidebar-nav'
import { useCurrentLocale } from '@/locales/client'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { SidebarRootProviders } from '@/components/providers/root-providers'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import {
  unifiedInsetPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import {
  HEADER_Z_INDEX,
  CONTENT_PADDING,
  CONTENT_PADDING_Y,
  APP_SHELL_SOFT_BORDER_STYLE,
} from '@/lib/constants/layout'
import { Building2, Tags, BookOpen, Mail, BarChart, LayoutDashboard } from 'lucide-react'
import type { MobileNavItem } from '@/components/mobile-bottom-nav'

export function AdminClientLayout({
  children,
  defaultSidebarOpen,
}: {
  children: React.ReactNode
  defaultSidebarOpen: boolean
}) {
  const router = useRouter()
  const locale = useCurrentLocale()
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))

    if (params.get('error')) {
      const errorDescription = params.get('error_description')
      toast.error('Authentication Error', {
        description: errorDescription?.replace(/\+/g, ' ') || 'An error occurred during authentication',
      })
      router.replace(`/${locale}/authentication`)
    }
  }, [locale, router])

  const mobileItems: MobileNavItem[] = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: 'Home' },
    { href: `/${locale}/admin/propfirms`, icon: Building2, label: 'Firms' },
    { href: `/${locale}/admin/blogs`, icon: BookOpen, label: 'Studio' },
    { href: `/${locale}/admin/coupons`, icon: Tags, label: 'Offers' },
    { href: `/${locale}/admin/newsletter-builder`, icon: Mail, label: 'Mail' },
    { href: `/${locale}/admin/weekly-recap`, icon: BarChart, label: 'Recap' },
  ]

  return (
    <SidebarRootProviders
      defaultOpen={defaultSidebarOpen}
      withAuthTimeout
      style={APP_SHELL_SOFT_BORDER_STYLE}
    >
      <SidebarNav />
      <SidebarInset className="qe-v2-app-shell relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-0 h-32 rounded-b-[2rem] border border-primary/10 bg-primary/[0.03]" />
        <header
          className={`${HEADER_Z_INDEX} sticky top-0 px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4`}
        >
          <div className="mx-auto flex w-full max-w-[1800px] items-center">
            <div className={cn(unifiedSectionPanelClassName, 'flex min-h-[4.5rem] w-full flex-col gap-4 rounded-[2rem] px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between')}>
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/40 bg-background/72 text-foreground/62 shadow-none transition-[opacity,background-color,border-color] duration-200 hover:border-primary/18 hover:bg-primary/10 hover:text-foreground/95 md:h-9 md:w-9" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className="hidden rounded-full border border-primary/18 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90 sm:inline-flex">
                      Admin
                    </span>
                    <h1 className="truncate whitespace-nowrap text-sm font-bold uppercase tracking-[0.18em] text-foreground/95">
                      Operations Studio
                    </h1>
                  </div>
                  <p className="truncate pt-1 text-xs text-foreground/46">
                    Production-ready controls for publishing, campaigns, reviews, and internal operations.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:w-auto">
                <div className={cn(unifiedInsetPanelClassName, 'rounded-[1.3rem] px-3 py-2.5')}>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">
                    Mode
                  </span>
                  <span className="block pt-1 text-sm text-foreground/72">
                    Editorial and growth ops
                  </span>
                </div>
                <div className={cn(unifiedInsetPanelClassName, 'rounded-[1.3rem] px-3 py-2.5')}>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">
                    Scope
                  </span>
                  <span className="block pt-1 text-sm text-foreground/72">
                    Publishing, offers, mail, recap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className={`flex-1 overflow-y-auto ${CONTENT_PADDING_Y} ${CONTENT_PADDING} relative z-0`}>
          <div className="mx-auto flex max-w-[1800px] flex-col">
            {children}
          </div>
        </main>
        <MobileBottomNav items={mobileItems} />
      </SidebarInset>
    </SidebarRootProviders>
  )
}
