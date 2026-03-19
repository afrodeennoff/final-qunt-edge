"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Bot, ChevronRight, Radar, ShieldAlert, Sparkles } from 'lucide-react'

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

function FeatureGrid({ items, delay = 0 }: { items: typeof intelligenceFeatures; delay?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.35,
              delay: delay + index * 0.05,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <Card className="h-full rounded-md border border-border/60 bg-card p-5 transition-all duration-200 hover:border-border/80 hover:bg-card/80">
              <CardHeader className="space-y-3 px-0 pb-0">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-[hsl(var(--primary)/0.1)] text-foreground">
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
          </motion.div>
        )
      })}
    </div>
  )
}

export default function AIFuturesSection() {
  const [activeTab, setActiveTab] = useState('intelligence')

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mx-auto max-w-6xl space-y-8 rounded-md border border-border/60 bg-card/60 p-8 text-foreground sm:space-y-10 sm:p-10">
          <div className="space-y-3 text-center">
            <Badge
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

          <Tabs defaultValue="intelligence" className="w-full" onValueChange={setActiveTab}>
            <div className="relative">
              <TabsList className="h-auto w-full justify-start rounded-md border border-border/60 bg-transparent p-0">
                <TabsTrigger
                  value="intelligence"
                  className="rounded-md px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 data-[state=active]:text-foreground [font-family:var(--home-copy)]"
                >
                  Intelligence
                  {activeTab === 'intelligence' && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-4 right-4 h-px bg-foreground/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  className="rounded-md px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 data-[state=active]:text-foreground [font-family:var(--home-copy)]"
                >
                  Automation
                  {activeTab === 'automation' && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-4 right-4 h-px bg-foreground/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TabsContent value="intelligence" className="mt-6">
                  <FeatureGrid items={intelligenceFeatures} delay={0} />
                </TabsContent>
                <TabsContent value="automation" className="mt-6">
                  <FeatureGrid items={automationFeatures} delay={0} />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <Card className="mt-6 rounded-md border border-border/60 bg-[hsl(var(--primary)/0.06)]">
            <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground [font-family:var(--home-copy)] sm:flex-row sm:items-center sm:justify-between">
              <p className="leading-relaxed">
                AI decisions stay auditable with a transparent reason trail, so every recommendation can be reviewed.
              </p>
              <Badge
                variant="outline"
                className="w-fit border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-foreground"
              >
                Explainable AI
              </Badge>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center pt-2">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-md border border-border/60 bg-[hsl(var(--primary)/0.1)] px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.18)]"
            >
              See AI Features in Action
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
