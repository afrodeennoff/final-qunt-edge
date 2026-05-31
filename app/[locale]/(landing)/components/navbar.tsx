'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'

type NavLink = { title: string; href: string }

export default function Navbar() {
  const t = useI18n()
  const pathname = usePathname()
  const locale = useCurrentLocale()

  const links: NavLink[] = useMemo(
    () => [
      { title: 'Features', href: '/#features' },
      { title: 'Pricing', href: '/pricing' },
      { title: 'Prop Firms Catalogue', href: '/propfirms' },
      { title: 'Deals', href: '/deals' },
      { title: 'Leaderboard', href: '/leaderboard' },
      { title: 'Teams', href: '/teams' },
      { title: 'Blog', href: '/blogs' },
      { title: 'Support', href: '/support' },
      { title: 'Docs', href: '/docs' },   // ← moved here per user request
    ],
    [],
  )

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[1400px]">
        <div
          className={cn(
            'relative flex min-h-[3.5rem] items-center justify-between overflow-hidden rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-3 py-1.5 sm:min-h-[4rem] sm:px-4 sm:py-2',
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--qe-ref-green)]/20 to-transparent" />
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-lg px-2 py-2 min-h-[44px] min-w-[44px] transition-colors hover:bg-[var(--qe-ref-surface-2)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] text-[var(--qe-ref-green)]">
              <Logo className="h-4 w-4 fill-current" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-[var(--qe-ref-text)] sm:inline-flex">
              Qunt Edge
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-150 min-h-[36px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qe-ref-green)]/40',
                  isActive(link.href)
                    ? 'bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)] border border-[var(--qe-ref-green)]/30'
                    : 'text-[var(--qe-ref-text-muted)] hover:bg-[var(--qe-ref-surface-2)] hover:text-[var(--qe-ref-text)]',
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/${locale}/authentication`}
              className="hidden md:inline-flex items-center rounded-full border border-[var(--qe-ref-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--qe-ref-text-muted)] transition hover:border-[var(--qe-ref-green)]/40 hover:text-[var(--qe-ref-text)] min-h-[44px]"
            >
              {t('landing.navbar.signIn')}
            </Link>

            <Link
              href={`/${locale}/authentication`}
              className="hidden md:inline-flex items-center rounded-full bg-[var(--qe-ref-green)] px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90 min-h-[44px]"
            >
              {t('landing.hero.ctaPrimary')}
            </Link>

            <UnifiedMobileNav
              groups={[{ links: links.map((link) => ({ href: `/${locale}${link.href}`, label: link.title })) }]}
              footer={
                <Link
                  href={`/${locale}/authentication`}
                  className="w-full inline-flex items-center justify-center rounded-full bg-[var(--qe-ref-green)] px-5 py-3 text-sm font-semibold text-black min-h-[44px]"
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
