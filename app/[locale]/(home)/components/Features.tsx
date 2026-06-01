'use client'

import { Eye, Brain, Layout, Newspaper, Sparkles } from 'lucide-react'

const items = [
  {
    icon: Eye,
    title: 'Instant Clarity',
    desc: 'See your real edge in seconds — not hours. Every metric that actually moves the needle, surfaced automatically.',
  },
  {
    icon: Brain,
    title: 'Pattern Recognition',
    desc: 'Automatically surfaces your winning and losing patterns across time, instruments, sessions, and mindset.',
  },
  {
    icon: Layout,
    title: 'All-in-One Workspace',
    desc: 'Broker sync, trade journal, performance analytics, and prop firm rules — finally in one clean place.',
  },
  {
    icon: Newspaper,
    title: 'Daily Edge Reports',
    desc: 'Get a clear, actionable summary of what went well and what to fix — delivered every day.',
  },
]

export function Features() {
  return (
    <section className="animate-fade-in-up py-24 border-b-0">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3 w-3" />
            The Solution
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Built for clarity, not noise.
          </h2>
          <p className="mt-4 text-[14px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            Everything you need to understand your edge. Nothing that gets in the way.
          </p>
        </div>

        <div className="animate-stagger grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="animate-fade-in-up group relative overflow-hidden rounded-2xl bg-card border-0 p-7 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15"
              >
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
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
      </div>
    </section>
  )
}
