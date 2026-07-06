'use client'

import Link from 'next/link'
import { Activity, ArrowRight, LineChart, ShieldCheck, Users } from 'lucide-react'
import { useCurrentLocale } from '@/locales/client'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

const teamHighlights = [
  {
    title: 'Desk visibility',
    body: 'See performance, behavioral consistency, and challenge pressure across members in one place.',
    icon: Activity,
  },
  {
    title: 'Coaching rhythm',
    body: 'Turn review into a repeatable weekly process instead of one-off screen-share sessions.',
    icon: Users,
  },
  {
    title: 'Operational control',
    body: 'Move from individual journals to a team-wide operating layer without changing the core workflow.',
    icon: ShieldCheck,
  },
]

export default function TeamsPageClient() {
  const locale = useCurrentLocale()

  return (
    <UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12 sm:py-16">
      <div className="space-y-6">
        <section
          className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-6 sm:p-8 lg:p-10')}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(780px_280px_at_10%_4%,rgba(255,255,255,0.08),transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_240px_at_88%_10%,rgba(255,255,255,0.04),transparent_72%)]" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.8fr)] xl:items-end">
            <div className="space-y-5">
              <span className={unifiedChipClassName}>Teams</span>
              <h1 className="max-w-4xl text-[clamp(2.2rem,5vw,4.35rem)] font-black leading-[1.1] tracking-tight text-foreground">
                A shared trading desk, rebuilt as one command surface.
              </h1>
              <p className="max-w-2xl text-sm leading-[1.55] text-muted-foreground sm:text-base">
                Monitor trader performance, review analytics, and coordinate decisions across your
                desk with workflows designed for funded teams, coaching groups, and operational
                trading leads.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/teams/dashboard`} className={unifiedPrimaryActionClassName}>
                  Open team dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/${locale}/support`} className={unifiedGhostActionClassName}>
                  Contact sales
                </Link>
              </div>
            </div>

            <div
              className={cn(
                unifiedInsetPanelClassName,
                'animate-scale-reveal animate-scale-reveal-d1 p-4 sm:p-5',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Desk snapshot
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">One review surface</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ['Member visibility', 'Shared rankings, capital, and discipline cues'],
                  ['Weekly review', 'Keep coaching aligned around one operating rhythm'],
                  ['Leader control', 'Give managers clearer trade and risk context'],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={cn(
                      unifiedInsetPanelClassName,
                      'animate-scale-reveal p-3 sm:p-4',
                      index === 0 && 'animate-scale-reveal-d1',
                      index === 1 && 'animate-scale-reveal-d2',
                      index === 2 && 'animate-scale-reveal-d3',
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-[1.55] text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d2 p-5 sm:p-6',
          )}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Desk foundations
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                The same structured experience across review, coaching, and coordination
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Keep the team surface aligned with the same shell language used on the public tools:
              one strong overview, a compact action rail, and clear secondary sections beneath it.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {teamHighlights.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={cn(
                    unifiedInsetPanelClassName,
                    'animate-scale-reveal p-5',
                    index === 0 && 'animate-scale-reveal-d1',
                    index === 1 && 'animate-scale-reveal-d2',
                    index === 2 && 'animate-scale-reveal-d3',
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </UnifiedPageShell>
  )
}
