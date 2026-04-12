'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'

export default function TeamsPageClient() {
  const locale = useCurrentLocale()

  return (
    <main className="qe-v2-app-shell mx-auto w-full max-w-[1360px] px-4 py-20 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_30px_80px_-44px_rgba(0,0,0,0.95),0_0_100px_-40px_oklch(0.65_0.22_260/0.16)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.65_0.22_260/0.12),transparent_42%),radial-gradient(circle_at_bottom_right,oklch(0.82_0.185_155/0.06),transparent_30%)]" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px] lg:gap-8">
          <div className="relative">
            <p className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/38">
              Teams
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-[350] tracking-[-0.05em] text-foreground sm:text-5xl">
              A shared trading desk, rebuilt as one command surface.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-[1.8] tracking-[-0.01em] text-foreground/56 sm:text-base">
              Monitor trader performance, review analytics, and coordinate decisions across your desk with workflows designed for funded teams, coaching groups, and operational trading leads.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/teams/dashboard`}
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-[13px] font-semibold tracking-[-0.01em] text-black shadow-[0_0_30px_rgba(255,255,255,0.14)]"
              >
                Open Team Dashboard
              </Link>
              <Link
                href={`/${locale}/support`}
                className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-[13px] font-medium tracking-[-0.01em] text-foreground/76 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-foreground"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.8rem] border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Desk visibility</p>
              <p className="mt-3 text-sm leading-[1.75] text-foreground/62">
                See performance, behavioral consistency, and challenge pressure across members in one place.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Coaching rhythm</p>
              <p className="mt-3 text-sm leading-[1.75] text-foreground/62">
                Turn review into a repeatable weekly process instead of one-off screen-share sessions.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-white/[0.08] bg-white/[0.04] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Operational control</p>
              <p className="mt-3 text-sm leading-[1.75] text-foreground/62">
                Move from individual journals to a team-wide operating layer without changing the core workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
