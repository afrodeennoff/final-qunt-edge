'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Activity, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-8%,hsl(var(--foreground)/0.16)_0%,transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:44px_44px] sm:bg-[size:52px_52px]" />
        <div className="absolute inset-x-10 top-8 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.34),transparent)]" />

        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q200,180 400,200 T800,150 T1200,180 T1600,140 T2000,160"
              stroke="url(#chart-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 flex justify-center">
          <Badge
            variant="secondary"
            className="relative border-border/70 bg-card/70 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]"
          >
            <span className="absolute inset-0 animate-pulse rounded bg-primary/20" />
            <Sparkles className="relative mr-2 h-3.5 w-3.5 text-primary" />
            <span className="relative">Live decision telemetry for discretionary traders</span>
          </Badge>
        </div>

        <h1 className="mx-auto max-w-5xl text-center text-[clamp(3.5rem,11vw,8rem)] font-semibold leading-[0.85] tracking-[-0.05em] [font-family:var(--home-display)]">
          Build repeatable edge.
          <span className="mt-3 block bg-[linear-gradient(95deg,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.5)_100%)] bg-clip-text text-transparent">
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-foreground/85 sm:text-lg [font-family:var(--home-copy)]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        <div className="mt-14 flex w-full flex-col items-center justify-center gap-4 sm:mt-16 sm:w-auto sm:flex-row sm:gap-5">
          <Button
            asChild
            size="lg"
            className="group relative h-14 w-full max-w-[340px] overflow-hidden rounded-2xl bg-primary text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 sm:min-w-[240px] sm:w-auto [font-family:var(--home-copy)]"
          >
            <Link href={`/${locale}/authentication?next=dashboard`}>
              <span className="relative z-10">Start Free Audit</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 w-full max-w-[340px] rounded-2xl border-2 border-border/50 bg-card/50 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 sm:min-w-[240px] sm:w-auto [font-family:var(--home-copy)]"
          >
            <Link href={`/${locale}/#pricing`}>
              See Pricing
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.16em] text-foreground/70 [font-family:var(--home-copy)]">
          <span className="rounded-full border border-border/40 bg-background/50 px-4 py-2 backdrop-blur-sm">
            No credit card required
          </span>
          <span className="rounded-full border border-border/40 bg-background/50 px-4 py-2 backdrop-blur-sm">
            First audit in minutes
          </span>
          <span className="rounded-full border border-border/40 bg-background/50 px-4 py-2 backdrop-blur-sm">
            Built for discretionary futures traders
          </span>
        </div>

        <div className="mt-20">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/50 bg-background/30 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/60 [font-family:var(--home-mono)]">
                  LIVE_METRICS_v2.4.1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/60 [font-family:var(--home-mono)]">
                  LIVE
                </span>
              </div>
            </div>

            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-background/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70 [font-family:var(--home-copy)]">
                      Session Grade Confidence
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] [font-family:var(--home-display)]">
                      94<span className="text-2xl">%</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-500 [font-family:var(--home-mono)]">
                      <Activity className="h-3 w-3" />
                      +2.4% WoW
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-background/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70 [font-family:var(--home-copy)]">
                      Rule Adherence Uplift
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground [font-family:var(--home-display)]">
                      +37<span className="text-2xl">%</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-500 [font-family:var(--home-mono)]">
                      <Activity className="h-3 w-3" />
                      +5.1% WoW
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-background/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70 [font-family:var(--home-copy)]">
                      Impulse Trades Reduced
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-primary [font-family:var(--home-display)]">
                      -42<span className="text-2xl">%</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-500 [font-family:var(--home-mono)]">
                      <Activity className="h-3 w-3" />
                      -8.3% WoW
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/60 [font-family:var(--home-copy)]">
          {[
            { name: 'Tradovate', highlighted: false },
            { name: 'Rithmic', highlighted: false },
            { name: 'IBKR', highlighted: false },
            { name: 'CQG', highlighted: false },
            { name: 'NINJA|TRADER', highlighted: true },
            { name: 'CSV Import', highlighted: false },
          ].map((item) => (
            <span
              key={item.name}
              className={`transition-colors duration-300 hover:text-foreground ${item.highlighted ? 'font-semibold tracking-[0.15em] text-primary' : ''}`}
            >
              {item.highlighted ? (
                <>
                  NINJA<span className="mx-1 align-baseline text-primary">|</span>TRADER
                </>
              ) : (
                item.name
              )}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-sm tracking-[0.08em] text-foreground/75 [font-family:var(--home-copy)]">
          Join free. Import your first session.           Get a ranked diagnostic before your next open.
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
