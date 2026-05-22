import { CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'

export default function ProblemStatement() {
  const pains = [
    { title: "Scattered Data", desc: "Trades across 4 brokers, 12 spreadsheets, and zero single source of truth." },
    { title: "Blind Spots", desc: "You know you’re profitable but have no idea which setups actually generate your edge." },
    { title: "No Real Review", desc: "End-of-day journaling is a joke. You repeat the same expensive mistakes weekly." },
  ]

  return (
    <MarketingSection className="border-b border-[oklch(0.65_0.22_260/0.08)] py-12 sm:py-16" innerClassName="max-w-[1280px]">
      <MarketingSectionHeader
        eyebrow="The Problem"
        title="Trading is hard enough. Your tools shouldn’t make it harder."
        align="center"
      />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {pains.map((pain, i) => (
          <Card key={i} variant="frost" className="p-7">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">{pain.title}</div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{pain.desc}</p>
          </Card>
        ))}
      </div>
    </MarketingSection>
  )
}
