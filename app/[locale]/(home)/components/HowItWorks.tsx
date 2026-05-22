'use client'

import { cn } from '@/lib/utils'
import {
  unifiedBodyCopyClassName,
  unifiedSectionEyebrowClassName,
} from '@/components/layout/unified-page-recipes'
import { motion } from 'motion/react'
import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { InteractiveWrapper } from '@/components/animation/interactive'
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
    <MarketingSection id="how-it-works" className="relative overflow-hidden py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8">
        <Card variant="glass" className="p-6 lg:sticky lg:top-28 lg:h-fit">
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.workflow.eyebrow')}</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4.6vw,4rem)] font-medium leading-[0.97] tracking-[-0.05em] text-foreground">
            {t('landing.home.workflow.title')}
          </h2>
          <p className={cn(unifiedBodyCopyClassName, 'mt-5 max-w-xl')}>
            {t('landing.home.workflow.description')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card variant="flat" className="space-y-2 p-4 border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.signalTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.workflow.signalDescription')}
              </p>
            </Card>
            <Card variant="flat" className="space-y-2 p-4 border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.cadenceTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.workflow.cadenceDescription')}
              </p>
            </Card>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <InteractiveWrapper key={String(step.name)} hover="scale">
              <motion.div
                className="flex h-full flex-col rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[oklch(0.65_0.22_260/0.12)] bg-[oklch(0.65_0.22_260/0.06)] text-sm font-semibold text-[oklch(0.65_0.22_260)]">
                    0{index + 1}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {t('landing.home.workflow.stage')} {index + 1}
                  </span>
                </div>
                <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-foreground">
                  {step.name}
                </h3>
                <p className="mt-3 text-sm leading-[1.65] text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            </InteractiveWrapper>
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}
