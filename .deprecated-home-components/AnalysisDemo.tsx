'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useTypedI18n } from '@/locales/client'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { CardV2 as Card } from '@/components/ui/v2'

const mockData = [
  { time: '09:30', price: 4312, ema: 4308, volume: 32 },
  { time: '10:00', price: 4326, ema: 4313, volume: 45 },
  { time: '10:30', price: 4318, ema: 4315, volume: 38 },
  { time: '11:00', price: 4337, ema: 4320, volume: 58 },
  { time: '11:30', price: 4345, ema: 4328, volume: 62 },
  { time: '12:00', price: 4332, ema: 4330, volume: 41 },
  { time: '12:30', price: 4348, ema: 4334, volume: 54 },
  { time: '13:00', price: 4358, ema: 4341, volume: 59 },
  { time: '13:30', price: 4349, ema: 4344, volume: 43 },
  { time: '14:00', price: 4367, ema: 4350, volume: 67 },
]

const AnalysisDemoChart = dynamic(() => import('./analysis-demo-chart'), {
  loading: () => <div className="h-full w-full animate-pulse rounded-md border border-border bg-muted/30" />,
})

export default function AnalysisDemo() {
  const t = useTypedI18n()

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.analysis.eyebrow')}
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-foreground">
            {t('landing.home.analysis.title')}
          </h2>
        </div>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          {t('landing.home.analysis.description')}
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r lg:border-border">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {t('landing.home.analysis.streamLabel')}
                </p>
                <p className="mt-2 tabular-nums text-3xl font-bold tracking-tight text-foreground">
                  4,367.00
                </p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                +1.27%
              </span>
            </div>

            <div className={cn('overflow-hidden rounded-md border border-border bg-muted/30 p-3', 'h-[320px]')}>
              <AnalysisDemoChart data={mockData} />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t('landing.home.analysis.journalSignals')}
              </p>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.analysis.liveLabel')}
              </span>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-foreground">
                {String(t('landing.home.analysis.log1'))}
              </p>
            </div>

            <MetricCard label={String(t('landing.home.analysis.planAdherence'))} value="87%" />
            <MetricCard label={String(t('landing.home.analysis.riskDrift'))} value="-22%" />

            <div className="rounded-md border border-border bg-muted/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t('landing.home.analysis.anomalyProbability')}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/60">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </MarketingSection>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="default" className="p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 tabular-nums text-2xl font-bold text-foreground">{value}</p>
    </Card>
  )
}
