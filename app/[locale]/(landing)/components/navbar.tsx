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
  ], [t])

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] flex justify-center px-4 pt-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className={cn('mx-auto w-full', MARKETING_SHELL_WIDTH)}>
        <nav
          className={cn(
            'pointer-events-auto relative flex items-center justify-between gap-4 h-14 w-full max-w-[1280px] rounded-2xl px-5 backdrop-blur-[20px] backdrop-saturate-180',
            'border border-[rgba(139,92,246,0.1)] bg-[rgba(15,15,20,0.8)]',
            'shadow-[0_4px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]',
            'transition-[background-color,border-color,box-shadow] duration-[300ms]',
          )}
        >
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-[300ms] hover:bg-[rgba(139,92,246,0.08)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-[0_4px_12px_-4px_rgba(139,92,246,0.4)]">
              <Logo className="h-4 w-4 fill-current" />
            </div>
            <span className="hidden text-[14px] font-[600] tracking-[-0.015em] text-[var(--mkt-text-primary)] sm:inline-flex bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
              Qunt Edge
            </span>
          </Link>

          {/* Nav links — minimalist underline indicator */}
          <div className="mx-auto hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    'relative px-4 py-2 text-[13px] font-[500] tracking-[-0.005em] transition-all duration-[200ms]',
                    active
                      ? 'text-purple-400'
                      : 'text-[var(--mkt-text-tertiary)] hover:text-[var(--mkt-text-secondary)]',
                  )}
                >
                  {link.title}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href={`/${locale}/authentication`}
              className="hidden h-9 items-center justify-center rounded-xl px-4 text-[13px] font-[500] text-[var(--mkt-text-tertiary)] transition-all duration-[200ms] hover:text-[var(--mkt-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] md:inline-flex"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className="hidden h-9 items-center justify-center gap-1.5 rounded-xl px-5 text-[13px] font-[600] text-white transition-all duration-[300ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(139,92,246,0.4)] active:scale-[0.98] md:inline-flex"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(109,40,217,1) 100%)',
                boxShadow: '0 4px 16px -8px rgba(139,92,246,0.4)'
              }}
            >
              {t('landing.hero.ctaPrimary')}
            </Link>

            <UnifiedMobileNav
              groups={[{ links: links.map((link) => ({ href: `/${locale}${link.href}`, label: link.title })) }]}
              footer={
                <Link
                  href={`/${locale}/authentication`}
                  className={cn(unifiedPrimaryActionClassName, 'w-full rounded-xl h-9')}
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
