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
 <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3">
 <motion.div
 initial={isMobile ? false : { opacity: 0, y: -18 }}
 animate={isMobile ? undefined : { opacity: 1, y: 0 }}
 transition={isMobile ? undefined : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
 className="w-full"
 >
 <motion.div
 className={cn(
 'w-full max-w-5xl mx-auto flex items-center justify-between h-12 px-4 rounded-full border border-[oklch(0.2505_0.0293_299.5707/0.9)] bg-[oklch(0.1249_0.0104_301.6956/0.78)] backdrop-saturate-200 shadow-[0_0_0_0.5px_oklch(0.6083_0.2172_297.1153/0.10),0_8px_32px_-8px_rgba(0,0,0,0.70)]'
)}
 whileHover={isMobile ? undefined : { y: -1 }}
 transition={isMobile ? undefined : { duration: 0.2 }}
 >
 <Link href={`/${locale}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.2505_0.0293_299.5707/0.9)] bg-[oklch(0.6083_0.2172_297.1153/0.08)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.85)]">
 <Logo className="h-4.5 w-4.5 fill-[var(--text-secondary)]" />
 </div>
 <span className="hidden sm:inline-flex text-[13px] font-semibold tracking-[-0.02em] text-foreground/95">Qunt Edge</span>
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
 'relative rounded-xl px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-200',
 isActive(link.href)
 ? 'border border-[oklch(0.6083_0.2172_297.1153/0.22)] bg-[oklch(0.6083_0.2172_297.1153/0.12)] text-foreground/95 shadow-[0_0_0_0.5px_oklch(0.6083_0.2172_297.1153/0.08)]'
 : 'text-[13px] font-medium text-foreground/55 hover:text-foreground/95 transition-colors duration-150 tracking-[-0.005em]'
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
 className="hidden rounded-xl px-3 py-2 text-[13px] font-medium text-foreground/55 hover:text-foreground/95 transition-colors duration-150 tracking-[-0.005em] md:inline-flex"
 >
 Login
 </Link>
 <Button
 asChild
 size="sm"
 variant="default"
 className="hidden h-8 items-center px-4 rounded-full text-[12px] font-semibold tracking-[-0.01em] transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
 >
 <Link href={`/${locale}/authentication`}>Start Free Audit</Link>
 </Button>

 <UnifiedMobileNav
 groups={[{ links: LINKS.map((l) => ({ href: l.href, label: l.title })) }]}
 footer={
 <Button
 asChild
 variant="default"
 className="w-full rounded-full"
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
