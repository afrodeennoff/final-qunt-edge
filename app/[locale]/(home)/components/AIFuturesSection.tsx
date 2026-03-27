"use client"
import { BadgeV2 } from "@/components/ui/v2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Bot, Radar, ShieldAlert, Sparkles } from 'lucide-react'

const intelligenceFeatures = [
  {
    title: 'Behavior Drift Radar',
    description: 'Flags subtle shifts in risk behavior and setup quality before they become drawdowns.',
    icon: Radar,
  },
  {
    title: 'AI Session Debrief',
    description: 'Creates concise recaps of what worked, what broke, and what to adjust next session.',
    icon: Bot,
  },
  {
    title: 'Execution Quality Score',
    description: 'Scores trades against your ruleset so process wins are visible, even on flat PnL days.',
    icon: Brain,
  },
]

const automationFeatures = [
  {
    title: 'Playbook Auto-Builder',
    description: 'Converts your best sessions into reusable setup templates and checklist-ready plans.',
    icon: Sparkles,
  },
  {
    title: 'Risk Intervention Alerts',
    description: 'Escalates coaching prompts when sizing, frequency, or emotional variance crosses limits.',
    icon: ShieldAlert,
  },
  {
    title: 'Weekly Performance Briefs',
    description: 'Auto-compiles concise weekly reports for self-review, mentors, or desk standups.',
    icon: Bot,
  },
]

function FeatureGrid({ items }: { items: typeof intelligenceFeatures }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.title}>
            <Card
              variant="glass"
              className="h-full rounded-[28px] border border-border/70 bg-card/80 p-5 shadow-[0_20px_45px_-28px_hsl(var(--foreground)/0.9)]"
            >
              <CardHeader className="space-y-3 px-0 pb-0">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary)/0.14)] text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

export default function AIFuturesSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl space-y-8 rounded-[36px] border border-border/70 bg-background/95 p-8 shadow-[0_30px_80px_-48px_hsl(var(--foreground)/0.9)] text-foreground sm:space-y-10 sm:p-10">
        <div className="space-y-3 text-center">
          <BadgeV2
            variant="outline"
            className="border-border/60 bg-[hsl(var(--primary)/0.18)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]"
          >
            Must-Have AI Features
          </Badge>
          <h2 className="text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            AI that improves
            <span className="block text-foreground">decision quality, not just reporting</span>
          </h2>
        </div>

        <Tabs defaultValue="intelligence" className="w-full">
          <TabsList className="h-auto w-full justify-start rounded-[28px] border border-border/70 bg-card/70 p-1">
            <TabsTrigger
              value="intelligence"
              className="rounded-lg px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition duration-150 data-[state=active]:bg-[hsl(var(--primary)/0.25)] data-[state=active]:text-foreground data-[state=active]:shadow-[0_8px_35px_-20px_hsl(var(--foreground)/0.9)] [font-family:var(--home-copy)]"
            >
              Intelligence
            </TabsTrigger>
            <TabsTrigger
              value="automation"
              className="rounded-lg px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition duration-150 data-[state=active]:bg-[hsl(var(--primary)/0.25)] data-[state=active]:text-foreground data-[state=active]:shadow-[0_8px_35px_-20px_hsl(var(--foreground)/0.9)] [font-family:var(--home-copy)]"
            >
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligence" className="mt-6">
            <FeatureGrid items={intelligenceFeatures} />
          </TabsContent>
          <TabsContent value="automation" className="mt-6">
            <FeatureGrid items={automationFeatures} />
          </TabsContent>
        </Tabs>

        <Card
          variant="glass"
          className="mt-6 rounded-[28px] border border-border/70 bg-card/80 shadow-[0_12px_50px_-26px_hsl(var(--foreground)/0.9)]"
        >
          <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground [font-family:var(--home-copy)] sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-relaxed">
              AI decisions stay auditable with a transparent reason trail, so every recommendation can be reviewed.
            </p>
            <BadgeV2
              variant="outline"
              className="w-fit border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-foreground"
            >
              Explainable AI
            </Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
