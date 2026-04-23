'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import {
  unifiedInsetPanelClassName,
  unifiedGhostActionClassName,
  unifiedPrimaryActionClassName,
} from '@/components/layout/unified-page-recipes'
import { Logo } from '@/components/logo'
import { MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'
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
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-2.5 sm:px-6 sm:py-3">
      <div className={cn('mx-auto w-full', MARKETING_SHELL_WIDTH)}>
        <div
          className={cn(
            unifiedInsetPanelClassName,
            'relative flex min-h-[4rem] items-center justify-between overflow-hidden rounded-[1.15rem] px-3 py-2 sm:px-4',
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/22 to-transparent" />
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.95rem] border border-border/18 bg-background/28 text-muted-foreground">
              <Logo className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-foreground sm:inline-flex">
              Qunt Edge
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  'inline-flex h-[38px] items-center rounded-[0.95rem] border border-border/16 px-4 text-[13px] font-medium tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isActive(link.href)
                    ? 'border-border/24 bg-background/48 text-foreground'
                    : 'text-muted-foreground hover:border-border/22 hover:bg-background/52 hover:text-foreground',
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/${locale}/authentication`}
              className={cn(unifiedGhostActionClassName, 'hidden px-4 py-2 text-sm md:inline-flex')}
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className={cn(
                unifiedPrimaryActionClassName,
                'hidden h-9 px-4 text-sm md:inline-flex',
              )}
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
