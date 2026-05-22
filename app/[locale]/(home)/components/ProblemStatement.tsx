import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'

export default function ProblemStatement() {
  const pains = [
    { title: 'Scattered Data', desc: 'Trades across 4 brokers, 12 spreadsheets, and zero single source of truth.' },
    { title: 'Blind Spots', desc: 'You know you&rsquo;re profitable but have no idea which setups actually generate your edge.' },
    { title: 'No Real Review', desc: 'End-of-day journaling is a joke. You repeat the same expensive mistakes weekly.' },
  ]

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-[1280px]">
      <MarketingSectionHeader
        eyebrow="The Problem"
        title="Trading is hard enough. Your tools shouldn&rsquo;t make it harder."
        align="center"
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pains.map((pain, i) => (
          <Card key={i} className="p-6">
            <div className="text-[14px] font-semibold tracking-tight text-foreground">{pain.title}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{pain.desc}</p>
          </Card>
        ))}
      </div>
    </MarketingSection>
  )
}
