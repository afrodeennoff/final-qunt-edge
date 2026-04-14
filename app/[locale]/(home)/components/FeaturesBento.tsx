'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Brain, Download, FileText, Shield, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
} from '@/components/animation/enhanced-motion'
import { useTypedI18n } from '@/locales/client'

const issueIcons = [BarChart3, Brain, Users]
const featureIcons = [BarChart3, Brain, Users, Download, FileText, Shield]

export default function FeaturesBento() {
  const t = useTypedI18n()

  const issues = [1, 2, 3].map((index) => ({
    badge: t(`landing.home.features.issue${index}Badge`),
    title: t(`landing.home.features.issue${index}Title`),
    description: t(`landing.home.features.issue${index}Description`),
    solution: t(`landing.home.features.issue${index}Solution`),
    icon: issueIcons[index - 1],
  }))

  const features = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`landing.home.features.feature${index}Title`),
    description: t(`landing.home.features.feature${index}Description`),
    icon: featureIcons[index - 1],
    highlighted: index === 2,
    colSpan: index === 4 ? 'lg:col-span-2' : index <= 2 || index >= 5 ? 'lg:col-span-1' : '',
  }))

  return (
    <MotionSection className="relative overflow-hidden px-4 py-20 sm:py-24 md:px-6 lg:px-8 lg:py-32">
      {/* Atmospheric glow orbs */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.features.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.features.title')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('landing.home.features.highlight')}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.features.description')}
          </p>
        </motion.div>

        <MotionStagger className="grid gap-4 md:grid-cols-3" delay={0.08}>
          {issues.map((issue) => {
            const Icon = issue.icon
            return (
              <MotionStaggerItem key={String(issue.title)}>
                <article className="h-full rounded-lg border-white/[0.06] bg-card/70 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full border-white/[0.06] bg-background/70 text-primary"
                  >
                    {issue.badge}
                  </Badge>
                  <h3 className="type-h4 mt-4 text-foreground">{issue.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {issue.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border-white/[0.06] bg-background/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-foreground/90 transition-[background-color,border-color,box-shadow,filter,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.12]">
                    <ArrowRight className="h-3 w-3" />
                    <span>{issue.solution}</span>
                  </div>
                </article>
              </MotionStaggerItem>
            )
          })}
        </MotionStagger>

        <div className="mt-10 mb-5">
          <Badge variant="secondary" size="sm" className="rounded-full px-3 text-foreground/70">
            {t('landing.home.features.listLabel')}
          </Badge>
        </div>

        <MotionStagger className="grid gap-4 lg:grid-cols-4" delay={0.08}>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <MotionStaggerItem key={String(feature.title)} className={feature.colSpan}>
                <article
                  className={`h-full rounded-lg border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)] ${
                    feature.highlighted
                      ? 'border-primary/20 bg-card hover:border-primary/30'
                      : 'border-white/[0.06] bg-card/70 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  {feature.highlighted ? (
                    <Badge
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-full border-primary/20 bg-primary/10 text-primary"
                    >
                      {t('landing.home.features.feature2Badge')}
                    </Badge>
                  ) : null}

                  <h3 className="type-h4 mt-4 text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </MotionStaggerItem>
            )
          })}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
