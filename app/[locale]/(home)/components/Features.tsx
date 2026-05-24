'use client'

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
