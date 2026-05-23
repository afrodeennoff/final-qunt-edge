import { getTypedI18n } from '@/locales/server'
import { Users, Building2, Bot, Zap } from 'lucide-react'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { CardV2 as Card } from '@/components/ui/v2'

export default async function LiveStatsStrip() {
  const t = await getTypedI18n()

  const stats = [
    { value: '35+', label: 'Prop Firms Integrated', icon: Building2 },
    { value: '12k+', label: 'Professional Traders', icon: Users },
    { value: '17', label: 'AI Analysis Tools', icon: Bot },
    { value: '<4m', label: 'Avg. Data Sync Time', icon: Zap },
  ]

  return (
    <MarketingSection className="py-8 sm:py-12" innerClassName="max-w-[1280px]">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[28px] font-semibold tracking-[-0.04em] tabular-nums text-foreground leading-none">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{stat.label}</p>
            </Card>
          )
        })}
      </div>
    </MarketingSection>
  )
}
