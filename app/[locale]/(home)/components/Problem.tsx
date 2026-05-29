'use client'

import { AlertCircle, Search, Puzzle, Clock, ArrowRight } from 'lucide-react'

const items = [
  {
    icon: AlertCircle,
    title: 'Data Overload',
    desc: "You're drowning in raw trade data but still can't see what actually matters.",
  },
  {
    icon: Search,
    title: 'No Real Insights',
    desc: "Most platforms just show numbers. You need to understand why you're winning or losing.",
  },
  {
    icon: Puzzle,
    title: 'Disconnected Tools',
    desc: 'Your broker, journal, stats, and prop firm rules all live in different places.',
  },
  {
    icon: Clock,
    title: 'Slow Feedback Loops',
    desc: 'You only realize what went wrong days or weeks later — if at all.',
  },
]

export function Problem() {
  return (
    <section className="py-24 border-b border-border/20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-3 inline-block rounded-full border border-destructive/20 bg-destructive/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-destructive">
            The Problem
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Trading tools today create more noise than clarity.
          </h2>
          <p className="mt-4 text-[14px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            Every platform adds another layer of complexity. The signal gets buried deeper.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-border/30 bg-card/30 p-6 transition-all duration-300 hover:border-destructive/20 hover:bg-destructive/[0.02] hover:shadow-[0_0_30px_-15px] hover:shadow-destructive/10"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 ring-1 ring-destructive/10">
                    <Icon className="h-4.5 w-4.5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] mb-1.5 text-foreground/90">{item.title}</h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground/70">{item.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-[13px] text-muted-foreground/50">
            <span>There is a better way</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </section>
  )
}
