'use client'

import { Eye, Brain, Layout, Newspaper } from 'lucide-react'

const icons = [Eye, Brain, Layout, Newspaper]

export function Features() {
  const features = [
    {
      title: "Instant Clarity",
      desc: "See your real edge in seconds — not hours. Every metric that actually moves the needle, surfaced automatically."
    },
    {
      title: "Pattern Recognition",
      desc: "Automatically surfaces your winning and losing patterns across time, instruments, sessions, and mindset."
    },
    {
      title: "All-in-One Workspace",
      desc: "Broker sync, trade journal, performance analytics, and prop firm rules — finally in one clean place."
    },
    {
      title: "Daily Edge Reports",
      desc: "Get a clear, actionable summary of what went well and what to fix — delivered every day."
    }
  ]

  return (
    <section className="py-20 border-b border-border/30">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="relative inline-block">
            <h2 className="text-3xl font-semibold tracking-tight">Built for traders who want clarity, not noise</h2>
            <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
          <p className="mt-4 text-muted-foreground text-base">Everything you need. Nothing you don't.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((f, i) => {
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
                    <div className="font-semibold text-lg mb-1.5">{f.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
          <h2 className="text-3xl font-semibold tracking-tight">Built for traders who want clarity, not noise</h2>
          <p className="mt-4 text-muted-foreground text-base">Everything you need. Nothing you don’t.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-border/30 p-6 transition-colors hover:border-border/50">
              <div className="font-semibold text-lg mb-2">{f.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
