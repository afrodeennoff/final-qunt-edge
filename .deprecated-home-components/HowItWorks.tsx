'use client'

import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { useTypedI18n } from '@/locales/client'

const steps = [
  { name: 'Connect', description: 'Link your broker and import your trading history automatically.' },
  { name: 'Analyze', description: 'AI-powered analytics surface patterns in your execution.' },
  { name: 'Journal', description: 'Structured debriefs turn every session into actionable insight.' },
  { name: 'Improve', description: 'Track behavioral metrics and refine your edge over time.' },
  { name: 'Scale', description: 'Build consistency and graduate to larger allocations.' },
]

export default function HowItWorks() {
  const t = useTypedI18n()

  return (
    <MarketingSection id="how-it-works" className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1280px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('landing.home.workflow.eyebrow')}
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.85rem,4vw,2.55rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-foreground">
            {t('landing.home.workflow.title')}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {t('landing.home.workflow.description')}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="space-y-1 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t('landing.home.workflow.signalTitle')}
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {t('landing.home.workflow.signalDescription')}
              </p>
            </Card>
            <Card className="space-y-1 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t('landing.home.workflow.cadenceTitle')}
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {t('landing.home.workflow.cadenceDescription')}
              </p>
            </Card>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <Card key={step.name} className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-[12px] font-semibold text-muted-foreground">
                  0{index + 1}
                </div>
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {t('landing.home.workflow.stage')} {index + 1}
                </span>
              </div>
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                {step.name}
              </h3>
              <p className="mt-2 text-[12px] leading-[1.5] text-muted-foreground">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}
