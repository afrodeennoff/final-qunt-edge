'use client'

import { AlertCircle, Search, Puzzle, Clock } from 'lucide-react'

const icons = [AlertCircle, Search, Puzzle, Clock]

export function Problem() {
  const problems = [
    {
      title: "Data Overload",
      desc: "You're drowning in raw trade data but still can't see what actually matters."
    },
    {
      title: "No Real Insights",
      desc: "Most platforms just show numbers. You need to understand why you're winning or losing."
    },
    {
      title: "Disconnected Tools",
      desc: "Your broker, journal, stats, and prop firm rules all live in different places."
    },
    {
      title: "Slow Feedback Loops",
      desc: "You only realize what went wrong days or weeks later — if at all."
    }
  ]

  return (
    <section className="py-20 border-b border-border/30">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">The real problem with trading tools today</h2>
          <p className="mt-4 text-muted-foreground text-base">Most platforms add noise instead of clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {problems.map((p, i) => {
            const Icon = icons[i]
            return (
              <div
                key={i}
                className="group rounded-xl border border-border/40 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_25px_-10px] hover:shadow-primary/15"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1.5">{p.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
  ]

  return (
    <section className="py-20 border-b border-border/30">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">The real problem with trading tools today</h2>
          <p className="mt-4 text-muted-foreground text-base">Most platforms add noise instead of clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/30 p-6 transition-colors hover:border-border/50">
              <div className="font-semibold text-lg mb-2">{p.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
