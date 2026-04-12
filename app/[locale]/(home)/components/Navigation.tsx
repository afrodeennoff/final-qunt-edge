'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UnifiedMobileNav } from '@/components/mobile-nav'

interface NavigationProps {
  locale: string
}

export default function Navigation({ locale }: NavigationProps) {
  const navLinks = [
    { href: `/${locale}/pricing`, label: 'Pricing' },
    { href: `/${locale}/docs`, label: 'Docs' },
    { href: `/${locale}/blogs`, label: 'Blog' },
  ]

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between rounded-[2rem] border border-white/[0.08] bg-black/72 px-4 shadow-[0_0_0_0.5px_rgba(180,210,255,0.08),0_24px_70px_-40px_rgba(0,0,0,0.92)] backdrop-blur-2xl backdrop-saturate-200 sm:px-5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_0_22px_oklch(0.65_0.22_260/0.35)] transition-shadow duration-300 group-hover:shadow-[0_0_32px_oklch(0.65_0.22_260/0.45)]">
            <span className="text-primary-foreground font-bold text-sm">Q</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-[-0.02em] text-foreground/95">Qunt Edge</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/28">Obsidian</span>
          </div>
        </Link>

        <div className="hidden rounded-full border border-white/[0.06] bg-white/[0.03] p-1 md:flex md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-foreground/52 transition-all duration-200 hover:bg-white/[0.06] hover:text-foreground/95 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full px-4 text-foreground/60 hover:bg-white/[0.05] hover:text-foreground/95">
            Login
          </Button>
          <Button size="sm" className="rounded-full bg-white px-4 text-black hover:bg-white/90">
            Start Free
          </Button>
        </div>

        <UnifiedMobileNav
          groups={[{ links: navLinks }]}
          footer={
            <div className="flex flex-col gap-3">
              <Button variant="outline" size="lg" className="w-full rounded-full border-white/[0.12] bg-white/[0.04]">
                Login
              </Button>
              <Button size="lg" className="w-full rounded-full bg-white text-black hover:bg-white/90">
                Start Free
              </Button>
            </div>
          }
        />
      </div>
    </nav>
  )
}
