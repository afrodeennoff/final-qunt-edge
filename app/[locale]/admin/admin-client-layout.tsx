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
  HEADER_HEIGHT,
  HEADER_Z_INDEX,
  HEADER_BORDER,
  HEADER_BG,
  CONTENT_PADDING,
  CONTENT_PADDING_Y,
} from '@/lib/constants/layout'
import { Building2, Tags, BookOpen, Mail, BarChart } from 'lucide-react'
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
    { href: `/${locale}/admin/propfirms`, icon: Building2, label: 'Firms' },
    { href: `/${locale}/admin/blogs`, icon: BookOpen, label: 'Blog' },
    { href: `/${locale}/admin/coupons`, icon: Tags, label: 'Coupons' },
    { href: `/${locale}/admin/newsletter-builder`, icon: Mail, label: 'Newsletter' },
    { href: `/${locale}/admin/weekly-recap`, icon: BarChart, label: 'Recap' },
  ]

  return (
    <SidebarRootProviders defaultOpen={defaultSidebarOpen} withAuthTimeout>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <SidebarNav />
        <SidebarInset className="flex-1 relative overflow-hidden bg-transparent">
          <header
            className={`${HEADER_HEIGHT} ${HEADER_Z_INDEX} ${HEADER_BORDER} ${HEADER_BG} flex items-center justify-between px-4 md:px-8 sticky top-0`}
          >
            <div className="flex items-center gap-4 flex-shrink-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <h1 className="text-sm font-bold text-foreground tracking-wide uppercase whitespace-nowrap">
                Admin Panel
              </h1>
            </div>
          </header>
          <main className={`flex-1 overflow-y-auto ${CONTENT_PADDING_Y} ${CONTENT_PADDING} relative z-0`}>
            {children}
          </main>
          <MobileBottomNav items={mobileItems} />
        </SidebarInset>
      </div>
    </SidebarRootProviders>
  )
}
