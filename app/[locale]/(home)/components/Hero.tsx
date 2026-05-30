import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Target, Zap, Sparkles } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { getI18n } from '@/locales/server'

export default async function Hero({ locale }: { locale: string }) {
  const t = await getI18n()

  return (
    <MarketingSection
      className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-24"
      innerClassName="max-w-[1280px]"
    >
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] max-w-full bg-[radial-gradient(ellipse_at_center,oklch(0.68_0.24_280_/_0.10),transparent_70%)]" />
      <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 bg-[radial-gradient(circle_at_center,oklch(0.65_0.22_260_/_0.06),transparent_70%)] blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Sparkles className="h-3 w-3" />
            {t('landing.hero.badge')}
          </div>

          <h1 className="mt-6 text-balance text-[50px] font-[260] leading-[0.92] tracking-[-0.03em] text-foreground sm:text-[68px] lg:text-[82px]">
            The{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              command center
            </span>
            <br />for serious traders.
          </h1>

          <p className="mt-6 max-w-[500px] text-[14px] leading-[1.7] text-muted-foreground/80">
            Real-time broker sync. AI that actually understands your edge. Brutal clarity on every session.
            Built for prop traders who treat trading like a profession.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 px-8 text-[14px] shadow-lg shadow-primary/20" rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start Free Edge Audit
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="h-12 border-transparent bg-card/50 px-6 text-[14px] backdrop-blur-sm hover:bg-muted/50">
              <Link href={`/${locale}/deals`}>
                <Play className="mr-2 h-4 w-4" /> Watch 60s Demo
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-8 text-[11px] text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span>12,400+ traders</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>35+ prop firms</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Real-time sync</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-xl opacity-60" />
          <div className="relative overflow-hidden rounded-xl border-0 bg-card/80 backdrop-blur-sm shadow-[0_0_40px_-16px] shadow-primary/20">
            <div className="flex items-center gap-2 border-b-0 bg-muted/40 px-3 py-2.5 text-[10px] text-muted-foreground">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
              <span className="ml-2 font-mono tracking-[0.08em] text-[9px]">LIVE SESSION &bull; QUNT EDGE</span>
              <div className="ml-auto flex items-center gap-1.5 rounded bg-muted px-1.5 py-px text-[9px] font-mono text-muted-foreground/70">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                LIVE
              </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-transparent/40">
              {[
                { label: 'TODAY PNL', value: '+$4,872', change: '+18.4%' },
                { label: 'WIN RATE', value: '74%', change: '+6%' },
                { label: 'EDGE SCORE', value: '91', change: '+3' },
              ].map((m, i) => (
                <div key={i} className="bg-card/60 p-5">
                  <div className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground/60">{m.label}</div>
                  <div className="mt-2 text-[28px] font-semibold tabular-nums tracking-tight text-foreground">{m.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-success">{m.change}</div>
                </div>
              ))}
            </div>

            <div className="relative h-28 border-t-0 bg-card/40 px-4 py-4">
              <svg viewBox="0 0 600 80" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 260)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 260)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,62 Q60,48 110,52 T210,34 T310,41 T410,22 T500,28 T600,12 L600,80 L0,80 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,62 Q60,48 110,52 T210,34 T310,41 T410,22 T500,28 T600,12"
                  fill="none"
                  stroke="oklch(0.65 0.22 260)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}
