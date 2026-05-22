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
    <MarketingSection className="py-8 sm:py-10" innerClassName="max-w-[1280px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
        <Card className="p-5">
          <Badge variant="accent" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em]">
            {t('landing.home.social.badge')}
          </Badge>
          <h2 className="mt-4 text-balance text-foreground text-[28px] sm:text-[34px] lg:text-[40px] font-semibold tracking-[-0.02em]">
            {t('landing.home.social.title')}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {t('landing.home.social.description')}
          </p>
        </Card>

        <div className="grid min-w-0 grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={String(stat.label)} className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 tabular-nums text-[26px] font-semibold tracking-tight text-foreground">
                  {stat.prefix}
                  {stat.value.toLocaleString('en-US')}
                  {stat.suffix}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{stat.label}</p>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <Card className="p-4 border-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {t('landing.home.social.onDeskFeedbackTitle')}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {t('landing.home.social.onDeskFeedbackDescription')}
            </p>
          </Card>

          <div className="grid gap-3">
            {testimonials.map((testimonial) => (
              <Card key={String(testimonial.name)} className="flex h-full flex-col p-4">
                <div className="mb-3 inline-flex w-fit rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t('landing.home.social.traderVoice')}
                </div>
                <MessageSquare className="mb-3 h-4 w-4 text-muted-foreground" />
                <blockquote className="mb-4 text-[13px] leading-relaxed text-foreground/90">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-muted text-xs font-semibold text-foreground">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Card className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {t('landing.home.social.trustFoundationTitle')}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {t('landing.home.social.trustFoundationDescription')}
            </p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <Card key={String(pillar.title)} className="p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
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
