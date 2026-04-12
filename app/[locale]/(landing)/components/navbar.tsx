'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { UnifiedMobileNav } from '@/components/mobile-nav'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale } from '@/locales/client'
import { useIsMobile } from '@/hooks/use-mobile'

type NavLink = { title: string; href: string }

const LINKS: NavLink[] = [
  { title: 'Features', href: '/#features' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Prop Firms', href: '/propfirms' },
  { title: 'Deals', href: '/deals' },
  { title: 'Leaderboard', href: '/leaderboard' },
  { title: 'Teams', href: '/teams' },
  { title: 'Blog', href: '/blogs' },
  { title: 'Support', href: '/support' },
]

export default function Navbar() {
  const pathname = usePathname()
  const locale = useCurrentLocale()
  const isMobile = useIsMobile()

  const isHomePath = useMemo(() => pathname === '/' || /^\/[a-z]{2}$/.test(pathname), [pathname])

  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return isHomePath
    const normalized = href.split('#')[0]
    return pathname === normalized || pathname.endsWith(normalized)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={isMobile ? false : { opacity: 0, y: -18 }}
        animate={isMobile ? undefined : { opacity: 1, y: 0 }}
        transition={isMobile ? undefined : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1320px] px-4 pt-3 sm:px-6 sm:pt-4"
      >
        <motion.div
          className={cn(
            'qe-v2-card flex h-[60px] items-center rounded-[calc(var(--radius)+0.4rem)] px-2.5 sm:h-[66px] sm:px-3.5',
            'border-[var(--frost-border)] bg-background/72 supports-[backdrop-filter]:bg-background/72 backdrop-blur-xl',
            'shadow-[0_28px_72px_-42px_rgba(4,10,24,0.9)]'
          )}
          whileHover={isMobile ? undefined : { y: -1 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-2xl px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--frost-border)] bg-card shadow-[0_18px_36px_-24px_rgba(4,10,24,0.85)]">
              <Logo className="h-4.5 w-4.5 fill-[var(--text-secondary)]" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-[var(--text-secondary)] sm:inline-flex">Qunt Edge</span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <motion.div
                key={link.href}
                whileHover={isMobile ? undefined : { y: -1 }}
                transition={isMobile ? undefined : { duration: 0.2 }}
              >
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    'relative rounded-2xl px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-200',
                    isActive(link.href)
                      ? 'border border-[var(--frost-border)] bg-card text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'text-[var(--text-secondary)] hover:bg-card hover:text-[var(--text-primary)]'
                  )}
                >
                  {link.title}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href={`/${locale}/authentication`}
              className="hidden rounded-2xl px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-card hover:text-[var(--text-primary)] md:inline-flex"
            >
              Login
            </Link>
            <Button
              asChild
              size="sm"
              variant="default"
              className="hidden rounded-pill px-5 text-[11px] font-semibold tracking-[0.03em] md:inline-flex"
            >
              <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
            </Button>

            <UnifiedMobileNav
              groups={[{ links: LINKS.map((l) => ({ href: l.href, label: l.title })) }]}
              footer={
              <Button
                asChild
                variant="default"
                className="w-full rounded-pill"
              >
                <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
              </Button>
              }
            />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
