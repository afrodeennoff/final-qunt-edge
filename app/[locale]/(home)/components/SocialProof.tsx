import {
  Clock,
  Globe,
  LifeBuoy,
  Lock,
  Server,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { BadgeV2 as Badge } from '@/components/ui/v2'
import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'

const statIcons = [Trophy, Globe, Clock]
const trustIcons = [Lock, Server, ShieldCheck, LifeBuoy]

export default async function SocialProof() {
  const t = await getTypedI18n()

  const stats = [
    { value: 12000, suffix: '+', icon: statIcons[0], label: 'Traders using Qunt Edge' },
    { value: 85, suffix: '%', icon: statIcons[1], label: 'Report better consistency' },
    { value: 100, suffix: '%', icon: statIcons[2], label: 'Data stays private' },
  ]

  const pillars = [1, 2, 3, 4].map((index) => ({
    title: t(`landing.home.trust${index}Title`),
    description: t(`landing.home.trust${index}Description`),
    icon: trustIcons[index - 1],
  }))

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1280px]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="p-6">
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em]">
            {t('landing.home.social.badge')}
          </Badge>
          <h2 className="mt-4 text-balance text-[28px] font-semibold tracking-[-0.02em] text-foreground sm:text-[34px] lg:text-[40px]">
            {t('landing.home.social.title')}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {t('landing.home.social.description')}
          </p>
        </Card>

        <div className="grid min-w-0 grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 tabular-nums text-[26px] font-semibold tracking-tight text-foreground">
                  {stat.value.toLocaleString('en-US')}{stat.suffix}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{stat.label}</p>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </MarketingSection>
  )
}
