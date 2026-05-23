'use client'

export function Problem() {
  const problems = [
    {
      title: "Data Overload",
      desc: "You’re drowning in raw trade data but still can’t see what actually matters."
    },
    {
      title: "No Real Insights",
      desc: "Most platforms just show numbers. You need to understand why you’re winning or losing."
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
    <section className="py-20 border-b border-border/40">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">The real problem with trading tools today</h2>
          <p className="mt-3 text-muted-foreground">Most platforms add noise instead of clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-6 hover:border-border transition-colors">
              <div className="font-semibold text-lg mb-2">{p.title}</div>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
