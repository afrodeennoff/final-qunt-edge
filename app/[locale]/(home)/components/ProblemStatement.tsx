import { AlertTriangle, Brain, MoveRight, Repeat } from 'lucide-react'

const problems = [
  {
    title: 'False Confidence',
    desc: 'A green day can hide weak execution. By the time PnL exposes it, the habit is already expensive.',
    icon: AlertTriangle,
  },
  {
    title: 'Decision Drift',
    desc: 'Tiny emotional slips snowball into oversized risk, forced entries, and broken risk limits.',
    icon: Brain,
  },
  {
    title: 'No Performance Loop',
    desc: 'Without structured review, you keep rehearsing noise instead of scaling your edge.',
    icon: Repeat,
  },
]

export default function ProblemStatement() {
  return (
    <section id="problem" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-12 lg:space-y-16">
          <div className="max-w-3xl space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/60 [font-family:var(--home-copy)]">
              The Gap
            </p>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.02em] [font-family:var(--home-display)]">
              Results tell you if you were paid,
              <span className="block text-foreground/80">not if you were good.</span>
            </h2>
            <p className="max-w-xl text-[15px] leading-[1.75] text-foreground/75 [font-family:var(--home-copy)]">
              Average traders celebrate outcomes. Elite traders audit decisions. Qunt Edge turns
              your raw trade history into a repeatable performance system.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)]">
              <MoveRight className="h-4 w-4 text-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground [font-family:var(--home-copy)]">
                Mindset Upgrade
              </p>
              <p className="text-sm text-foreground/70 [font-family:var(--home-copy)]">
                Promote process to first-class data. Let profit follow your standards.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 [font-family:var(--home-copy)]">
              Sound familiar?
            </p>
            <div className="space-y-5">
              {problems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--mk-surface-muted)/0.5)] text-foreground/80">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-medium tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/70 [font-family:var(--home-copy)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
