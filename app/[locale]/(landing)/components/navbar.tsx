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

  const links: NavLink[] = useMemo(() => [
    { title: 'Features', href: '/#features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Prop Firms Catalogue', href: '/propfirms' },
    { title: 'Deals', href: '/deals' },
    { title: 'Leaderboard', href: '/leaderboard' },
    { title: 'Teams', href: '/teams' },
    { title: 'Blog', href: '/blogs' },
    { title: 'Support', href: '/support' },
  ], [t])

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6">
      <div className="mx-auto w-full max-w-[1400px]">
        <div
          className={cn(
            unifiedInsetPanelClassName,
            'relative flex min-h-[4.25rem] items-center justify-between overflow-hidden rounded-2xl px-3.5 py-2 sm:px-4',
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 bg-background/40 text-muted-foreground">
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
                  'rounded-full border border-border/35 h-9 px-4 text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  isActive(link.href)
                    ? 'border-border/50 bg-background/60 text-foreground'
                    : 'text-muted-foreground hover:border-border/50 hover:bg-background/72 hover:text-foreground',
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
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
                'hidden h-[38px] px-5 text-sm md:inline-flex',
              )}
            >
              {t('landing.hero.ctaPrimary')}
            </Link>

            <UnifiedMobileNav
              groups={[{ links: links.map((link) => ({ href: `/${locale}${link.href}`, label: link.title })) }]}
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
