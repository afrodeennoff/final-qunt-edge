import { getTypedI18n } from '@/locales/server'
import { Users, Building2, Bot, Zap } from 'lucide-react'

export default async function LiveStatsStrip() {
  const t = await getTypedI18n()

  const stats = [
    { value: '35+', label: 'Prop Firms Integrated', icon: Building2 },
    { value: '12k+', label: 'Professional Traders', icon: Users },
    { value: '17', label: 'AI Analysis Tools', icon: Bot },
    { value: '<4m', label: 'Avg. Data Sync Time', icon: Zap },
  ]

  return (
    <div className="relative border-y border-white/10 bg-[#050505] py-10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-8 px-6 text-center md:grid-cols-4 lg:px-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="group flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[oklch(0.65_0.22_260)] transition group-hover:border-[oklch(0.65_0.22_260/0.4)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[42px] font-semibold tabular-nums tracking-[-0.02em] text-white">
                {stat.value}
              </div>
              <div className="text-[12px] font-medium tracking-[0.08em] text-white/60">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
