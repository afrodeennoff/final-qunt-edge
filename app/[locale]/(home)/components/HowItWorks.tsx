'use client'

import { ArrowRight, Plug, BarChart3, Brain } from 'lucide-react'

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
    <section className="border-t border-white/5 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-2 text-[10px] font-mono tracking-[3px] text-primary/70">HOW IT WORKS</div>
          <h2 className="text-balance text-4xl font-light tracking-tight sm:text-5xl">Three steps. Zero friction.</h2>
          <p className="mt-3 text-muted-foreground">From connected to dangerous in under two minutes.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.015] p-8 transition hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-sm font-mono tracking-[1px] text-primary">
                    {step.number}
                  </div>
                  <Icon className="h-5 w-5 text-primary/70 transition group-hover:text-primary" />
                </div>

                <h3 className="mt-6 text-xl font-medium tracking-tight">{step.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground/90">{step.desc}</p>

                {index < 2 && (
                  <div className="absolute -right-3 top-10 hidden text-primary/30 md:block">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
