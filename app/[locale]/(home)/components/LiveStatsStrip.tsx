import { getTypedI18n } from '@/locales/server'
import { Users, Building2, Bot, Zap } from 'lucide-react'
import { MarketingSection, MarketingStatBlock } from '@/components/layout/marketing-sections'
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
    <MarketingSection className="py-8 sm:py-10 border-y border-[oklch(0.65_0.22_260/0.08)] bg-background/95" innerClassName="max-w-[1280px]">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} variant="glass" className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] text-[oklch(0.65_0.22_260)]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[32px] font-[250] tracking-[-0.05em] tabular-nums text-foreground leading-none">{stat.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
            </Card>
          )
        })}
      </div>
    </MarketingSection>
  )
}
