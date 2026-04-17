'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import {
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
} from '@/components/layout/unified-page-recipes'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'

type NavLink = { title: string; href: string }

export default function Navbar() {
  const t = useI18n()
  const pathname = usePathname()
  const locale = useCurrentLocale()

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
      <div className="mx-auto w-full max-w-[1360px]">
        <div
          className={cn(
            unifiedInsetPanelClassName,
            'flex min-h-16 items-center justify-between rounded-full px-3.5 py-2 sm:px-4',
          )}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
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
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-[background-color,color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isActive(link.href)
                    ? 'border border-primary/18 bg-primary/10 text-primary'
                    : 'border border-transparent text-muted-foreground hover:border-border/35 hover:bg-background/70 hover:text-foreground',
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

            <Link
              href={`/${locale}/authentication`}
              className={cn(unifiedPrimaryActionClassName, 'hidden h-9 px-4 text-sm md:inline-flex')}
            >
              {t('landing.hero.ctaPrimary')}
            </Link>

            <UnifiedMobileNav
              groups={[{ links: links.map((link) => ({ href: link.href, label: link.title })) }]}
              footer={
                <Link
                  href={`/${locale}/authentication`}
                  className={cn(unifiedPrimaryActionClassName, 'w-full')}
                >
                  {t('landing.hero.ctaPrimary')}
                </Link>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}
