'use client'

import { motion } from 'motion/react'
import {
  Clock,
  Globe,
  LifeBuoy,
  Lock,
  MessageSquare,
  Server,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/animation/enhanced-motion'
import { useTypedI18n } from '@/locales/client'

const statIcons = [Trophy, Globe, Clock, MessageSquare]
const trustIcons = [Lock, Server, ShieldCheck, LifeBuoy]
const initials = ['FT', 'DM', 'TC']

export default function SocialProof() {
  const t = useTypedI18n()

  const stats = [
    {
      value: 12000,
      suffix: '+',
      icon: statIcons[0],
      prefix: '',
      label: t('landing.home.social.stat1Label'),
    },
    {
      value: 85,
      suffix: '%',
      icon: statIcons[1],
      prefix: '',
      label: t('landing.home.social.stat2Label'),
    },
    {
      value: 100,
      suffix: '%',
      icon: statIcons[2],
      prefix: '',
      label: t('landing.home.social.stat3Label'),
    },
    {
      value: 7,
      suffix: 'min',
      icon: statIcons[3],
      prefix: '<',
      label: t('landing.home.social.stat4Label'),
    },
  ]

  const testimonials = [1, 2, 3].map((index) => ({
    quote: t(`landing.home.social.testimonial${index}Quote`),
    name: t(`landing.home.social.testimonial${index}Name`),
    role: t(`landing.home.social.testimonial${index}Role`),
    initials: initials[index - 1],
  }))

  const pillars = [1, 2, 3, 4].map((index) => ({
    title: t(`landing.home.social.trust${index}Title`),
    description: t(`landing.home.social.trust${index}Description`),
    icon: trustIcons[index - 1],
  }))

  return (
    <section className="bg-muted/30 overflow-x-hidden px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <motion.div
          className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-lg border border-border/0.04 bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] md:p-8">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary"
            >
              {t('landing.home.social.badge')}
            </Badge>
            <h2 className="type-h2 mt-5 text-balance text-foreground lg:text-4xl xl:text-5xl">
              {t('landing.home.social.title')}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t('landing.home.social.description')}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.article
                  key={String(stat.label)}
                  className="rounded-lg border border-border/0.04 bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/0.04 bg-background/70 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 tabular-nums text-3xl font-bold tracking-tight text-foreground">
                    {stat.prefix}
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.label}</p>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <div className="mb-4 rounded-lg border border-border/0.04 bg-background/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.social.onDeskFeedbackTitle')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.social.onDeskFeedbackDescription')}
              </p>
            </div>

            <div className="grid gap-4">
              {testimonials.map((testimonial, index) => (
                <motion.article
                  key={String(testimonial.name)}
                  className="flex h-full flex-col rounded-lg border border-border/0.04 bg-card/70 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="mb-4 inline-flex w-fit rounded-full border border-border/0.04 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {t('landing.home.social.traderVoice')}
                  </div>
                  <MessageSquare className="mb-4 h-5 w-5 text-primary/60" />
                  <blockquote className="mb-6 text-sm leading-relaxed text-foreground/80">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border/0.04 bg-background/70 text-sm font-semibold text-primary">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 rounded-lg border border-border/0.04 bg-background/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.social.trustFoundationTitle')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.social.trustFoundationDescription')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon
                return (
                  <motion.article
                    key={String(pillar.title)}
                    className="rounded-lg border border-border/0.04 bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/0.04 bg-background/70 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
