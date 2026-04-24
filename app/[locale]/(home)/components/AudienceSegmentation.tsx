'use client'

import { motion } from 'motion/react'
import { ArrowRight, Target, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import { useTypedI18n } from '@/locales/client'

const audienceIcons = [Target, TrendingUp]

export default function AudienceSegmentation() {
  const t = useTypedI18n()

  const audiences = [
    {
      badge: t('landing.home.audience.propBadge'),
      title: t('landing.home.audience.propTitle'),
      description: t('landing.home.audience.propDescription'),
      cta: t('landing.home.audience.propCta'),
      features: [1, 2, 3, 4, 5].map((index) => t(`landing.home.audience.propFeature${index}`)),
      icon: audienceIcons[0],
    },
    {
      badge: t('landing.home.audience.independentBadge'),
      title: t('landing.home.audience.independentTitle'),
      description: t('landing.home.audience.independentDescription'),
      cta: t('landing.home.audience.independentCta'),
      features: [1, 2, 3, 4, 5].map((index) =>
        t(`landing.home.audience.independentFeature${index}`),
      ),
      icon: audienceIcons[1],
    },
  ]

  return (
    <MotionSection className="relative overflow-hidden bg-muted/20 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      {/* Atmospheric glow orb */}
      <div className="pointer-events-none absolute -left-40 bottom-1/4 h-[440px] w-[440px] rounded-full bg-primary/[0.05] blur-[120px]" />
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.audience.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.audience.title')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('landing.home.audience.highlight')}
            </span>
          </h2>
        </motion.div>

        <MotionStagger className="grid gap-4 md:grid-cols-2" delay={0.08}>
          {audiences.map((audience) => {
            const Icon = audience.icon
            return (
              <MotionStaggerItem key={String(audience.title)}>
                <article className="flex h-full flex-col rounded-lg border-border/0.04 bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-border/0.08 hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/30 bg-primary/10 text-primary"
                      >
                        {audience.badge}
                      </Badge>
                      <h3 className="type-h3 mt-4 text-foreground">{audience.title}</h3>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {audience.description}
                  </p>

                  <ul className="grid flex-1 gap-3">
                    {audience.features.map((feature) => (
                      <li key={String(feature)} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm leading-relaxed text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-primary/80">
                    {audience.cta}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </article>
              </MotionStaggerItem>
            )
          })}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
