'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
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
        className="mx-auto w-full max-w-[1320px] px-4 pt-4 sm:px-6"
      >
        <motion.div
          className={cn(
            'flex h-[56px] items-center rounded-full px-2.5 sm:h-[62px] sm:px-3.5',
            'bg-[hsl(var(--mk-surface)/0.78)] supports-[backdrop-filter]:bg-[hsl(var(--mk-surface)/0.74)] backdrop-blur-xl shadow-none'
          )}
          whileHover={isMobile ? undefined : { y: -1 }}
          transition={isMobile ? undefined : { duration: 0.2 }}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2 rounded-full px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--mk-surface-muted)/0.85)]">
              <Logo className="h-4.5 w-4.5 fill-[hsl(var(--mk-text))]" />
            </div>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline-flex">Qunt Edge</span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <motion.div key={link.href} whileHover={isMobile ? undefined : { y: -1 }} transition={isMobile ? undefined : { duration: 0.2 }}>
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className={cn(
                    'relative rounded-full px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition-all duration-200',
                    isActive(link.href)
                      ? 'bg-primary/15 text-[hsl(var(--mk-text))] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-4/5 after:rounded-full after:bg-[oklch(0.55_0.22_264)] after:shadow-[0_0_8px_oklch(0.55_0.22_264/0.5)]'
                      : 'text-foreground/80 hover:bg-[hsl(var(--mk-surface-muted)/0.7)] hover:text-[hsl(var(--mk-text))]'
                  )}
                >
                  {link.title}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ButtonV2  asChild variant="gradient-primary" size="sm" className="hidden rounded-full px-5 text-[10px] font-semibold uppercase tracking-[0.14em] md:inline-flex">
              <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
            </ButtonV2>

            <UnifiedMobileNav
              groups={[{ links: LINKS.map((l) => ({ href: l.href, label: l.title })) }]}
              footer={
                <ButtonV2 asChild className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
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
