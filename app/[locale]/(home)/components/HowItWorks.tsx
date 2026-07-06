'use client'

import { Plug, BarChart3, Brain, ArrowRight } from 'lucide-react'
import { InteractiveWrapper } from '@/components/interactive-wrapper'

const steps = [
  {
    number: '01',
    icon: Plug,
    title: 'Connect your broker',
    desc: 'One-click sync with Tradovate, Rithmic, or MT5. Your trades flow in automatically — no CSVs, no delays.',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'See the truth instantly',
    desc: 'Every session visualized. Win rate, expectancy, heatmaps, drawdowns. Brutal clarity on what actually works.',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Get AI that understands edge',
    desc: 'Qunt spots your real patterns, flags leaks, and tells you exactly what to fix before the next session.',
  },
]

export function HowItWorks() {
  return (
    <section className="animate-fade-in-up border-t-0 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-mono tracking-[3px] text-primary">
            HOW IT WORKS
          </div>
          <h2 className="text-balance text-4xl font-light tracking-tight sm:text-5xl">Three steps. Zero friction.</h2>
          <p className="mt-3 text-[14px] text-muted-foreground/70">From connected to dangerous in under two minutes.</p>
        </div>

        <div className="animate-stagger grid gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <InteractiveWrapper key={i} hover="cursor">
              <div
                className="animate-fade-in-up group relative rounded-2xl border-0 bg-gradient-to-b from-card/40 to-transparent p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_-15px] hover:shadow-primary/8"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-sm font-mono tracking-[1px] text-white shadow-sm">
                    {step.number}
                  </div>
                  <Icon className="h-5 w-5 text-primary/50 transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
                </div>

                <h3 className="mt-7 text-xl font-medium tracking-tight text-foreground/90">{step.title}</h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground/70">{step.desc}</p>

                {i < 2 && (
                  <div className="absolute -right-4 top-10 hidden md:flex items-center text-primary/25">
                    <span className="h-px w-6 bg-gradient-to-r from-primary/30 to-transparent" />
                    <ArrowRight className="h-4 w-4 -ml-1" />
                  </div>
                )}
              </div>
              </InteractiveWrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
