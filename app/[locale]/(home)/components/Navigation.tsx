'use client'

import Link from 'next/link'
import { ButtonV2 as Button } from '@/components/ui/v2'
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
    <nav className="fixed top-0 w-full z-50 border-b border-border/60 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.65)]">
            <span className="text-primary-foreground font-bold text-sm">Q</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">Qunt Edge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-[0.84rem] text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/[0.04] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Login
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-lg px-4">
            Start Free
          </Button>
        </div>

        <UnifiedMobileNav
          groups={[{ links: navLinks }]}
          footer={
            <div className="flex flex-col gap-3">
              <Button variant="outline" size="lg" className="w-full rounded-xl border-border/60">
                Login
              </Button>
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl">
                Start Free
              </Button>
            </div>
          }
        />
      </div>
    </nav>
  )
}
