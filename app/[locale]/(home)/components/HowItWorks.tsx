import { cn } from '@/lib/utils'
import {
  unifiedBodyCopyClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
  unifiedInsetPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { motion } from 'framer-motion'
import { InteractiveWrapper } from '@/components/interactive-wrapper'
import { getTypedI18n } from '@/locales/server'

const steps = [
  { name: 'Connect', description: 'Link your broker and import your trading history automatically.' },
  { name: 'Analyze', description: 'AI-powered analytics surface patterns in your execution.' },
  { name: 'Journal', description: 'Structured debriefs turn every session into actionable insight.' },
  { name: 'Improve', description: 'Track behavioral metrics and refine your edge over time.' },
  { name: 'Scale', description: 'Build consistency and graduate to larger allocations.' },
]

export default async function HowItWorks() {
  const t = await getTypedI18n()

  return (
    <section id="how-it-works" className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8">
        <motion.div
          className={cn(unifiedSectionPanelClassName, 'p-6 lg:sticky lg:top-28 lg:h-fit')}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.workflow.eyebrow')}</p>
          <h2 className="mt-4 text-balance text-[clamp(2.2rem,4.6vw,4rem)] font-medium leading-[0.97] tracking-[-0.05em] text-foreground">
            {t('landing.home.workflow.title')}
          </h2>
          <p className={cn(unifiedBodyCopyClassName, 'mt-5 max-w-xl')}>
            {t('landing.home.workflow.description')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className={cn(unifiedInsetPanelClassName, 'space-y-2 p-4')}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.signalTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.workflow.signalDescription')}
              </p>
            </div>
            <div className={cn(unifiedInsetPanelClassName, 'space-y-2 p-4')}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.cadenceTitle')}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {t('landing.home.workflow.cadenceDescription')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <InteractiveWrapper key={String(step.name)} hover="scale">
              <motion.article
                className={cn(unifiedInsetPanelClassName, 'flex h-full flex-col p-5')}
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/18 bg-primary/10 text-sm font-semibold text-primary">
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
              </motion.article>
            </InteractiveWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
