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
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between rounded-2xl frost-border-7 frost-bg-deep px-4 frost-shadow-inset-sm shadow-[0_24px_70px_-40px_rgba(0,0,0,0.92)] sm:px-5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm transition-shadow duration-300 group-hover:shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">Q</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-[-0.02em] text-foreground">Qunt Edge</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Obsidian
            </span>
          </div>
        </Link>

        <div className="hidden rounded-full border frost-border-5 frost-bg-dim p-1 md:flex md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-muted-foreground transition-[background-color,border-color,color,opacity] duration-200 hover:bg-background/0.09 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full px-4 text-foreground/60 hover:frost-bg hover:text-foreground"
          >
            <Link href={`/${locale}/authentication`}>Login</Link>
          </Button>
          <Button size="sm" asChild className="rounded-full px-4">
            <Link href={`/${locale}/authentication?next=dashboard`}>Start Free</Link>
          </Button>
        </div>

        <UnifiedMobileNav
          groups={[{ links: navLinks }]}
          footer={
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full rounded-full frost-border-7 frost-bg-dim"
              >
                <Link href={`/${locale}/authentication`}>Login</Link>
              </Button>
              <Button size="lg" asChild className="w-full rounded-full">
                <Link href={`/${locale}/authentication?next=dashboard`}>Start Free</Link>
              </Button>
            </div>
          }
        />
      </div>
    </nav>
  )
}
