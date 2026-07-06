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
import { getTypedI18n } from '@/locales/server'
import { InteractiveWrapper } from '@/components/interactive-wrapper'

const statIcons = [Trophy, Globe, Clock, MessageSquare]
const trustIcons = [Lock, Server, ShieldCheck, LifeBuoy]
const initials = ['FT', 'DM', 'TC']

export default async function SocialProof() {
  const t = await getTypedI18n()

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
    <section className="bg-muted/30 px-4 py-8 sm:py-12 lg:py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <div className="animate-fade-in-up rounded-lg border-0 bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] md:p-8">
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

          <div className="animate-stagger grid min-w-0 grid-cols-2 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <InteractiveWrapper key={String(stat.label)} hover="cursor">
                <article
                  className="animate-fade-in-up rounded-lg border-0 bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border-0 bg-background/70 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 tabular-nums text-3xl font-bold tracking-tight text-foreground">
                    {stat.prefix}
                    {stat.value.toLocaleString('en-US')}
                    {stat.suffix}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.label}</p>
                </article>
                </InteractiveWrapper>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="animate-fade-in-up">
            <div className="mb-4 rounded-lg border-0 bg-background/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.social.onDeskFeedbackTitle')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.social.onDeskFeedbackDescription')}
              </p>
            </div>

            <div className="animate-stagger grid gap-4">
              {testimonials.map((testimonial) => (
                <InteractiveWrapper key={String(testimonial.name)} hover="cursor">
                <article
                  className="animate-fade-in-up flex h-full flex-col rounded-lg border-0 bg-card/70 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                >
                  <div className="mb-4 inline-flex w-fit rounded-full border-0 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {t('landing.home.social.traderVoice')}
                  </div>
                  <MessageSquare className="mb-4 h-5 w-5 text-primary/60" />
                  <blockquote className="mb-6 text-sm leading-relaxed text-foreground/80">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border-0 bg-background/70 text-sm font-semibold text-primary">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </article>
                </InteractiveWrapper>
              ))}
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="mb-4 rounded-lg border-0 bg-background/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {t('landing.home.social.trustFoundationTitle')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('landing.home.social.trustFoundationDescription')}
              </p>
            </div>

            <div className="animate-stagger grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <InteractiveWrapper key={String(pillar.title)} hover="cursor">
                  <article
                    className="animate-fade-in-up rounded-lg border-0 bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border-0 bg-background/70 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </article>
                  </InteractiveWrapper>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
