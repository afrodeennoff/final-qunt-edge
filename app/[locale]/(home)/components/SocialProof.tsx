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
import { BadgeV2 as Badge } from '@/components/ui/v2'
import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'

const statIcons = [Trophy, Globe, Clock, MessageSquare]
const trustIcons = [Lock, Server, ShieldCheck, LifeBuoy]
const initials = ['FT', 'DM', 'TC']

export default async function SocialProof() {
  const t = await getTypedI18n()

  // Fallbacks for legacy keys that were refactored during redesign.
  // These four social-proof metrics are numeric and identical across locales.
  const stats = [
    { value: 12000, suffix: '+', icon: statIcons[0], prefix: '', label: 'Traders using Qunt Edge' },
    { value: 85, suffix: '%', icon: statIcons[1], prefix: '', label: 'Report better consistency' },
    { value: 100, suffix: '%', icon: statIcons[2], prefix: '', label: 'Data stays private' },
    { value: 7, suffix: 'min', icon: statIcons[3], prefix: '<', label: 'Avg. support response' },
  ]

  const testimonials = [1, 2, 3].map((index) => ({
    quote: t(`landing.home.testimonial${index}Quote`),
    name: t(`landing.home.testimonial${index}Name`),
    role: t(`landing.home.testimonial${index}Role`),
    initials: initials[index - 1],
  }))

  const pillars = [1, 2, 3, 4].map((index) => ({
    title: t(`landing.home.trust${index}Title`),
    description: t(`landing.home.trust${index}Description`),
    icon: trustIcons[index - 1],
  }))

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1360px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
        <Card variant="glass" className="p-6 md:p-8">
          <Badge
            variant="frost-info"
            className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]"
          >
            {t('landing.home.social.badge')}
          </Badge>
          <h2 className="mt-5 text-balance text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em]">
            {t('landing.home.social.title')}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {t('landing.home.social.description')}
          </p>
        </Card>

        <div className="grid min-w-0 grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={String(stat.label)} variant="glass" className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 tabular-nums text-3xl font-semibold tracking-tight text-foreground">
                  {stat.prefix}
                  {stat.value.toLocaleString('en-US')}
                  {stat.suffix}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.label}</p>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-4">
          <Card variant="flat" className="p-5 border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.social.onDeskFeedbackTitle')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('landing.home.social.onDeskFeedbackDescription')}
            </p>
          </Card>

          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <Card key={String(testimonial.name)} variant="glass" className="flex h-full flex-col p-6">
                <div className="mb-4 inline-flex w-fit rounded-full border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('landing.home.social.traderVoice')}
                </div>
                <MessageSquare className="mb-4 h-5 w-5 text-primary/60" />
                <blockquote className="mb-6 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] text-sm font-semibold text-primary">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card variant="flat" className="p-5 border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t('landing.home.social.trustFoundationTitle')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('landing.home.social.trustFoundationDescription')}
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <Card key={String(pillar.title)} variant="glass" className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}
