import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Target, Zap } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { getI18n } from '@/locales/server'

export default async function Hero({ locale }: { locale: string }) {
  const t = await getI18n()

  return (
    <MarketingSection
      className="pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
      innerClassName="max-w-[1280px]"
    >
      <div className="relative grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {t('landing.hero.badge')}
          </div>

          <h1 className="mt-6 text-balance text-[56px] font-[250] leading-[0.96] tracking-[-0.04em] text-foreground sm:text-[72px] lg:text-[88px]">
            The <span className="text-primary">command center</span>
            <br />for serious traders.
          </h1>

          <p className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-muted-foreground/90">
            Real-time broker sync. AI that actually understands your edge. Brutal clarity on every session.
            Built for prop traders who treat trading like a profession.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 px-8 text-[15px]" rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href={`/${locale}/authentication?next=dashboard`}>
                Start Free Edge Audit
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="h-12 border-border bg-card px-6 text-[15px] hover:bg-muted">
              <Link href={`/${locale}/deals`}>
                <Play className="mr-2 h-4 w-4" /> Watch 60s Demo
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[11px] text-muted-foreground/70">
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
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2 text-[10px] text-muted-foreground">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
              <span className="ml-2 font-mono tracking-[0.08em]">LIVE SESSION &bull; QUNT EDGE</span>
            </div>

            <div className="grid grid-cols-3 gap-px bg-border">
              {[
                { label: 'TODAY PNL', value: '+$4,872', change: '+18.4%' },
                { label: 'WIN RATE', value: '74%', change: '+6%' },
                { label: 'EDGE SCORE', value: '91', change: '+3' },
              ].map((m, i) => (
                <div key={i} className="bg-card p-4">
                  <div className="text-[9px] font-medium tracking-[0.1em] text-muted-foreground/70">{m.label}</div>
                  <div className="mt-2 text-[26px] font-semibold tabular-nums tracking-[-0.02em] text-foreground">{m.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-success">{m.change}</div>
                </div>
              ))}
            </div>

            <div className="relative h-24 border-t border-border bg-card px-4 py-4">
              <svg viewBox="0 0 600 80" className="h-full w-full" preserveAspectRatio="none">
                <path
                  d="M0,62 Q60,48 110,52 T210,34 T310,41 T410,22 T500,28 T600,12"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute right-3 top-2 rounded bg-muted px-1.5 py-px text-[9px] font-mono text-muted-foreground/70">LIVE</div>
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}
