'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SidebarNav } from './components/sidebar-nav'
import { useCurrentLocale } from '@/locales/client'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { SidebarRootProviders } from '@/components/providers/root-providers'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { BackgroundGlow } from '@/components/ui/background-glow'
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
        <BackgroundGlow variant="default" />
        <header
          className={`${HEADER_Z_INDEX} sticky top-0 px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4`}
        >
          <div className="mx-auto flex w-full max-w-[1800px] items-center">
            <div className="qe-v2-card flex min-h-[4.25rem] w-full items-center gap-3 px-3 py-2.5 sm:px-4">
              <SidebarTrigger className="h-10 w-10 rounded-2xl border border-v2-border/45 bg-v2-bg-surface/72 text-v2-text-secondary shadow-[0_14px_32px_-24px_rgba(8,15,34,0.92)] transition-all duration-200 hover:border-v2-border/70 hover:bg-v2-bg-hover hover:text-v2-text-primary md:h-9 md:w-9" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="hidden rounded-full border border-v2-border/30 bg-v2-bg-surface/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-v2-text-secondary sm:inline-flex">
                    Admin
                  </span>
                  <h1 className="truncate whitespace-nowrap text-sm font-bold uppercase tracking-[0.18em] text-v2-text-primary">
                    Operations Studio
                  </h1>
                </div>
                <p className="truncate pt-1 text-xs text-v2-text-secondary">
                  Production-ready controls for publishing, campaigns, reviews, and internal operations.
                </p>
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
