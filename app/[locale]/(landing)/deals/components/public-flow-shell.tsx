'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { MarketingSectionHeader } from '@/components/layout/marketing-sections'
import { cn } from '@/lib/utils'

const FLOW_LINKS = [
  { path: '/deals', label: 'Deals' },
  { path: '/deals/compare', label: 'Matchup' },
  { path: '/deals/guides', label: 'Playbooks' },
  { path: '/deals/calculator', label: 'Cost Planner' },
  { path: '/deals/faq', label: 'Help' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/deals') {
    return pathname.endsWith('/deals') || pathname === '/deals'
  }
  return pathname.endsWith(href)
}

export function PublicFlowShell({
  title,
  subtitle,
  children,
  compactHeader = false,
}: {
  title: string
  subtitle: string
  children: ReactNode
  compactHeader?: boolean
}) {
  const pathname = usePathname()
  const locale = pathname.match(/^\/([a-z]{2}(?:-[A-Za-z]{2})?)(?=\/|$)/i)?.[1] ?? 'en'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        {!compactHeader ? (
          <>
            <section className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-6 sm:p-8">
              <div>
                <MarketingSectionHeader
                  eyebrow="Futures Funding Offers Hub"
                  title={title}
                  titleAs="h1"
                  description={subtitle}
                  align="left"
                  className="m-0"
                />
                <nav className="mt-6 flex flex-wrap gap-2" aria-label="Deals flow">
                  {FLOW_LINKS.map((link) => {
                    const active = isActive(pathname, link.path)
                    return (
                      <Link
                        key={link.path}
                        href={`/${locale}${link.path}`}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/35 bg-background/60 text-foreground hover:border-border/45 hover:bg-background/25',
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </section>

            <section className="mt-6 grid gap-6 text-xs text-muted-foreground sm:grid-cols-3">
              <article className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-4">
                <p className="font-semibold uppercase tracking-[0.12em] text-foreground">
                  Offer Checks
                </p>
                <p className="mt-1">
                  Deal terms re-validated before listing changes are published.
                </p>
              </article>
              <article className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-4">
                <p className="font-semibold uppercase tracking-[0.12em] text-foreground">
                  Policy Context
                </p>
                <p className="mt-1">
                  Pricing, drawdown style, and payout notes linked in one flow.
                </p>
              </article>
              <article className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-4">
                <p className="font-semibold uppercase tracking-[0.12em] text-foreground">
                  Decision Tools
                </p>
                <p className="mt-1">
                  Compare, plan costs, and verify rules before committing capital.
                </p>
              </article>
            </section>
          </>
        ) : null}

        {children}
      </div>
    </div>
  )
}
