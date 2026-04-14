'use client'

import { motion } from 'framer-motion'
import { InteractiveWrapper } from '@/components/animation/interactive'
import { useTypedI18n } from '@/locales/client'

export default function HowItWorks() {
  const t = useTypedI18n()

  const steps = [1, 2, 3, 4, 5].map((index) => ({
    name: t(`landing.home.workflow.step${index}Name`),
    description: t(`landing.home.workflow.step${index}Description`),
  }))

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-muted/30 px-4 py-20 sm:py-24 md:px-6 lg:px-8 lg:py-32"
    >
      {/* Atmospheric glow orb */}
      <div className="pointer-events-none absolute -left-48 bottom-0 h-[440px] w-[440px] rounded-full bg-accent/[0.04] blur-[120px]" />
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8">
        <motion.div
          className="rounded-lg border-white/[0.06] bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] lg:sticky lg:top-28"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.workflow.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.workflow.title')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.workflow.description')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border-white/[0.06] bg-background/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.signalTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {t('landing.home.workflow.signalDescription')}
              </p>
            </div>
            <div className="rounded-md border-white/[0.06] bg-background/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.workflow.cadenceTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {t('landing.home.workflow.cadenceDescription')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <InteractiveWrapper key={String(step.name)} hover="scale">
              <motion.article
                className="flex h-full flex-col rounded-lg border-white/[0.06] bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]"
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                    0{index + 1}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {t('landing.home.workflow.stage')} {index + 1}
                  </span>
                </div>
                <h3 className="type-label text-foreground/90">{step.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
