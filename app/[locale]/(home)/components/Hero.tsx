import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Target, Zap } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { getI18n } from '@/locales/server'

export default async function Hero({ locale }: { locale: string }) {
  const t = await getI18n()

  return (
    <MarketingSection className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 overflow-hidden" innerClassName="max-w-[1280px]">
      {/* Static cobalt ambient glows — no animation per Obsidian V3 rules */}
      <div className="pointer-events-none absolute -top-24 -right-32 h-[520px] w-[520px] rounded-full bg-[oklch(0.65_0.22_260/0.08)] blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[oklch(0.65_0.22_260/0.05)] blur-[140px]" />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        {/* Left: Command messaging */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.65_0.22_260/0.2)] bg-[oklch(0.65_0.22_260/0.06)] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.65_0.22_260)]">
            {t('landing.hero.badge')}
          </div>

          <h1 className="mt-6 text-balance text-[56px] font-[250] leading-[0.96] tracking-[-0.04em] text-foreground sm:text-[72px] lg:text-[88px]">
            The <span className="bg-gradient-to-r from-[oklch(0.65_0.22_260)] via-white to-[oklch(0.65_0.22_260)] bg-clip-text text-transparent">command center</span><br />for serious traders.
          </h1>

          <p className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-muted-foreground/90">
            Real-time broker sync. AI that actually understands your edge. Brutal clarity on every session.
            Built for prop traders who treat trading like a profession.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 px-8 text-[15px]" rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start Free Edge Audit
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-[15px] hover:bg-white/10">
              <Link href={`/${locale}/deals`}>
                <Play className="mr-2 h-4 w-4" /> Watch 60s Demo
              </Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-9 flex items-center gap-8 text-[11px] text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[oklch(0.65_0.22_260)]" />
              <span>12,400+ traders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[oklch(0.65_0.22_260)]" />
              <span>35+ prop firms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.65_0.22_260)]" />
              <span>Real-time sync</span>
            </div>
          </div>
        </div>

        {/* Right: Premium static terminal preview */}
        <div className="relative hidden lg:block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-[0_0_0_1px_oklch(0.65_0.22_260/0.12),0_40px_120px_-20px_rgb(0,0,0)]">
            {/* Fake terminal header */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 text-[10px] text-white/60">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500/80" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 font-mono tracking-widest">QUNT EDGE — LIVE SESSION</span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-px bg-white/5 p-px">
              {[
                { label: 'TODAY PNL', value: '+$4,872', change: '+18.4%', good: true },
                { label: 'WIN RATE', value: '74%', change: '+6%', good: true },
                { label: 'EDGE SCORE', value: '91', change: '+3', good: true },
              ].map((m, i) => (
                <div key={i} className="bg-[#0a0a0f] p-5">
                  <div className="text-[10px] font-medium tracking-[0.12em] text-white/50">{m.label}</div>
                  <div className="mt-3 text-[28px] font-semibold tabular-nums tracking-[-0.02em] text-white">{m.value}</div>
                  <div className="mt-1 text-[12px] font-medium text-emerald-400">{m.change}</div>
                </div>
              ))}
            </div>

            {/* Static mini equity line (pure CSS, no JS) */}
            <div className="relative h-[110px] border-t border-white/10 bg-[#07070b] px-5 py-6">
              <svg viewBox="0 0 600 80" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cobalt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 260)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 260)" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,62 Q60,48 110,52 T210,34 T310,41 T410,22 T500,28 T600,12"
                  fill="none"
                  stroke="oklch(0.65 0.22 260)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,62 Q60,48 110,52 T210,34 T310,41 T410,22 T500,28 T600,12 L600,80 L0,80 Z"
                  fill="url(#cobalt)"
                />
              </svg>
              <div className="absolute right-5 top-4 rounded bg-white/5 px-2 py-px text-[9px] font-mono text-white/60">LIVE</div>
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}
