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
        <nav
          className={cn(
            'pointer-events-auto relative flex items-center justify-between gap-3 h-12 w-full max-w-[1100px] rounded-full px-3 backdrop-blur-2xl backdrop-saturate-180',
            'border border-[var(--mkt-border-subtle)] bg-[rgba(9,9,11,0.75)]',
            'shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_24px_-12px_rgba(0,0,0,0.50)]',
          )}
        >
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="group flex items-center gap-2 rounded-full px-2 py-1.5 transition-[background-color] duration-200 hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--mkt-accent-subtle)] border border-[var(--mkt-accent-border)] text-[var(--mkt-accent)]">
              <Logo className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="hidden text-[13px] font-semibold tracking-[-0.02em] text-[var(--mkt-text-primary)] sm:inline-flex">
              Qunt Edge
            </span>
          </Link>

          {/* Nav links — pill-shaped active indicator */}
          <div className="mx-auto hidden items-center gap-0.5 lg:flex">
            {links.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    'relative rounded-full px-3 py-1.5 text-[12.5px] font-medium tracking-[-0.005em] transition-[color,background-color] duration-150',
                    active
                      ? 'bg-[rgba(255,255,255,0.06)] text-[var(--mkt-text-primary)]'
                      : 'text-[var(--mkt-text-tertiary)] hover:text-[var(--mkt-text-secondary)] hover:bg-[rgba(255,255,255,0.03)]',
                  )}
                >
                  {link.title}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/${locale}/authentication`}
              className="hidden h-8 items-center justify-center rounded-full px-3.5 text-[12.5px] font-medium text-[var(--mkt-text-tertiary)] transition-[color,background-color] duration-150 hover:text-[var(--mkt-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] md:inline-flex"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className="hidden h-8 items-center justify-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-[0.5px] hover:shadow-[0_0_20px_rgba(139,92,246,0.30)] active:scale-[0.97] md:inline-flex"
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
        </nav>
      </div>
    </header>
  )
}
