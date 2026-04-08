'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ButtonV2 } from '@/components/ui/v2'
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
            'flex h-[58px] items-center rounded-full border px-2.5 sm:h-[62px] sm:px-3.5',
            'border-[var(--frost-border)] bg-background/80 supports-[backdrop-filter]:bg-background/80 backdrop-blur-sm',
            'shadow-none'
          )}
          whileHover={isMobile ? undefined : { y: -1 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--frost-border)] bg-[oklch(0.08_0_0)]">
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
                    'relative rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-200',
                    isActive(link.href)
                      ? 'bg-[oklch(0.08_0_0)] text-[var(--text-primary)] border border-[var(--frost-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[oklch(0.08_0_0)]'
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
              className="hidden rounded-full px-3 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:bg-[oklch(0.08_0_0)] md:inline-flex"
            >
              Login
            </Link>
            <ButtonV2
              asChild
              size="sm"
              variant="default"
              className="hidden rounded-pill px-5 text-[11px] font-semibold tracking-[0.03em] md:inline-flex"
            >
              <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
            </ButtonV2>

            <UnifiedMobileNav
              groups={[{ links: LINKS.map((l) => ({ href: l.href, label: l.title })) }]}
              footer={
                <ButtonV2
                  asChild
                  variant="default"
                  className="w-full rounded-pill"
                >
                  <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
                </ButtonV2>
              }
            />
          </div>
        </motion.div>
      </motion.div>
    </header>
  )
}
