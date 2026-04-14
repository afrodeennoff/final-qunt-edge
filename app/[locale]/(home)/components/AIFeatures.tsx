'use client'

import { motion } from 'framer-motion'
import { Brain, Radar, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import { useTypedI18n } from '@/locales/client'

const icons = [Brain, Radar, ShieldAlert, Sparkles]

export default function AIFeatures() {
  const t = useTypedI18n()

  const features = [1, 2, 3, 4].map((index) => ({
    icon: icons[index - 1],
    title: t(`landing.home.ai.feature${index}Title`, {}),
    description: t(`landing.home.ai.feature${index}Description`, {}),
    colSpan: index === 1 || index === 4 ? 'md:col-span-2' : 'md:col-span-1',
  }))

  return (
    <MotionSection className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-20 lg:px-8 xl:py-24">
      {/* Atmospheric glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-accent/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-[380px] w-[380px] rounded-full bg-primary/[0.03] blur-[120px]" />
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
        <motion.div
          className="rounded-lg border-border/60 bg-card/80 p-6 shadow-sm md:p-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.ai.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.ai.title')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.ai.description')}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border-border/60 bg-background/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.ai.reasonTrailTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {t('landing.home.ai.reasonTrailDescription')}
              </p>
            </div>
            <div className="rounded-md border-border/60 bg-background/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t('landing.home.ai.liveContextTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {t('landing.home.ai.liveContextDescription')}
              </p>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/40 hover:brightness-110">
            <Sparkles className="h-3.5 w-3.5" />
            {t('landing.home.ai.badge')}
          </div>
        </motion.div>

        <div className="space-y-4">
          <MotionStagger className="grid grid-cols-1 gap-4 md:grid-cols-3" delay={0.08}>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <MotionStaggerItem key={String(feature.title)} className={feature.colSpan}>
                  <article className="flex h-full flex-col rounded-lg border-border/60 bg-card/70 p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mt-4 inline-flex w-fit items-center rounded-full border-border/60 bg-background/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {t('landing.home.ai.capabilityLabel')}
                    </span>
                    <h3 className="type-h4 mt-4 text-foreground">{feature.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-primary/80">
                      <ArrowRight className="h-3.5 w-3.5" />
                      {t('landing.home.ai.inspectSignal')}
                    </div>
                  </article>
                </MotionStaggerItem>
              )
            })}
          </MotionStagger>

          <motion.div
            className="rounded-lg border-border/60 bg-card/70 p-5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.ai.footerDescription')}
              </p>
              <span className="inline-flex w-fit shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/40 hover:brightness-110">
                {t('landing.home.ai.footerBadge')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  )
}
