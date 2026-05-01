import {
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatBlock,
} from '@/components/layout/marketing-sections'
import { getTypedI18n } from '@/locales/server'

export default async function LiveStatsStrip() {
  const t = await getTypedI18n()

  const stats = [
    { value: '35+', label: t('landing.home.liveStats.stat1Label') },
    { value: '12+', label: t('landing.home.liveStats.stat2Label') },
    { value: '17', label: t('landing.home.liveStats.stat3Label') },
    { value: '4', label: t('landing.home.liveStats.stat4Label') },
  ]

  return (
    <MarketingSection>
      <div className="space-y-12">
        <MarketingSectionHeader
          eyebrow={t('landing.home.liveStats.heading')}
          title={t('landing.home.liveStats.title')}
          description={t('landing.home.liveStats.description')}
        />
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <MarketingStatBlock key={String(stat.label)} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </MarketingSection>
  )
}
