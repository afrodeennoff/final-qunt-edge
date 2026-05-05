'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import {
  unifiedPrimaryActionClassName,
} from '@/components/layout/unified-page-recipes'
import { Logo } from '@/components/logo'
import { MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useTypedI18n } from '@/locales/client'

type NavLink = { title: string; href: string }

export default function Navbar() {
  const t = useTypedI18n()
  const pathname = usePathname()
  const locale = useCurrentLocale()

  const links: NavLink[] = useMemo(() => [
    { title: String(t('landing.navbar.features')), href: '/#features' },
    { title: String(t('landing.navbar.pricing')), href: '/pricing' },
    { title: String(t('landing.navbar.propFirms')), href: '/propfirms' },
    { title: String(t('landing.navbar.propFirmPerk')), href: '/deals' },
    { title: String(t('landing.navbar.leaderboard')), href: '/leaderboard' },
    { title: String(t('landing.navbar.teams')), href: '/teams' },
    { title: String(t('landing.nav.blog')), href: '/blogs' },
    { title: String(t('landing.navbar.support')), href: '/support' },
  ], [t])

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
      <div className={cn('mx-auto w-full', MARKETING_SHELL_WIDTH)}>
        <div
          className={cn(
            'pointer-events-auto relative flex items-center justify-between gap-4 h-12 w-full max-w-[1100px] rounded-[1.15rem] px-4 backdrop-blur-2xl backdrop-saturate-180 border border-border/50 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-8px_rgba(0,0,0,0.40)]',
          )}
        >
          <Link href={`/${locale}`} className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-[background-color] duration-200 hover:bg-border/4">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-b from-primary/22 to-primary/12 border border-primary/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] text-primary">
              <Logo className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-foreground sm:inline-flex">
              Qunt Edge
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  'text-[13px] font-medium tracking-[-0.01em] transition-[color] duration-[120ms]',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href={`/${locale}/authentication`}
              className="h-8 px-3.5 text-[13px] rounded-full border border-[rgba(255,255,255,0.10)] bg-transparent text-[var(--mkt-text-secondary)] hover:text-[var(--mkt-text-primary)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.16)] hidden md:inline-flex"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className="h-8 px-4 text-[13px] font-semibold rounded-full text-white shadow-[0_0_12px_rgba(139,92,246,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] active:scale-[0.97] hidden md:inline-flex"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}
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
