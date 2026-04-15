'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'
import { useIsMobile } from '@/hooks/use-mobile'

type NavLink = { title: string; href: string }

export default function Navbar() {
  const t = useI18n()
  const pathname = usePathname()
  const locale = useCurrentLocale()
  const isMobile = useIsMobile()

  const links: NavLink[] = [
    { title: String(t('landing.navbar.features')), href: '/#features' },
    { title: String(t('landing.navbar.pricing')), href: '/pricing' },
    { title: String(t('landing.navbar.propFirms')), href: '/propfirms' },
    { title: String(t('landing.navbar.propFirmPerk')), href: '/deals' },
    { title: String(t('landing.navbar.leaderboard')), href: '/leaderboard' },
    { title: String(t('landing.navbar.teams')), href: '/teams' },
    { title: String(t('landing.nav.blog')), href: '/blogs' },
    { title: String(t('landing.navbar.support')), href: '/support' },
  ]

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/60 bg-background/90 px-4 shadow-sm">
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Logo className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline-flex">
              Qunt Edge
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/${locale}/authentication`}
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Button
              asChild
              size="sm"
              className="hidden h-9 rounded-full px-4 text-sm font-semibold md:inline-flex"
            >
              <Link href={`/${locale}/authentication`}>{t('landing.hero.ctaPrimary')}</Link>
            </Button>

            <UnifiedMobileNav
              groups={[{ links: links.map((link) => ({ href: link.href, label: link.title })) }]}
              footer={
                <Button asChild className="w-full rounded-full">
                  <Link href={`/${locale}/authentication`}>{t('landing.hero.ctaPrimary')}</Link>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}
