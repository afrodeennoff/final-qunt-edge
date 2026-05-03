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
            'pointer-events-auto relative flex items-center justify-between gap-4 h-12 w-full max-w-[1100px] rounded-full px-4 bg-[oklch(0.09_0.015_264_/_0.88)] backdrop-blur-2xl saturate-150 border border-[oklch(0.65_0.22_260_/_0.10)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.06),0_8px_24px_-12px_rgba(0,0,0,0.60)]',
          )}
        >
          <Link href={`/${locale}`} className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-[background-color] duration-200 hover:bg-[oklch(0.65_0.22_260_/_0.04)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-b from-primary/22 to-primary/12 border border-primary/16 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.06)] text-primary">
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
              className="h-8 px-3.5 text-[13px] rounded-full border border-[oklch(0.65_0.22_260_/_0.14)] bg-transparent text-muted-foreground hover:text-foreground hover:bg-[oklch(0.65_0.22_260_/_0.08)] hidden md:inline-flex"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className="h-8 px-4 text-[13px] font-semibold rounded-full bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_0.12)] hover:bg-primary/92 hidden md:inline-flex"
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
