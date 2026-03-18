import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'

const items = [
  {
    title: 'One Truth Timeline',
    desc: 'Unify fills, notes, and context into one performance record across brokers and imports.',
    icon: BarChart3,
  },
  {
    title: 'Execution Grade Engine',
    desc: 'Score every trade against your ruleset so discipline becomes measurable, not assumed.',
    icon: Database,
  },
  {
    title: 'AI Session Debriefs',
    desc: 'Get blunt post-session diagnostics with root causes and the next priorities to fix.',
    icon: Brain,
  },
  {
    title: 'Drift Alerts',
    desc: 'Detect emotional, sizing, and frequency drift before it compounds into drawdown.',
    icon: LayoutDashboard,
  },
  {
    title: 'Correction Loop',
    desc: 'Convert weak patterns into concrete interventions and track adherence week over week.',
    icon: CalendarCheck2,
  },
  {
    title: 'Desk-Level Oversight',
    desc: 'Give managers and mentors a clean, auditable view of process quality by trader.',
    icon: ShieldCheck,
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-1/2 h-[600px] w-[600px] rounded-full bg-[hsl(var(--primary)/0.03)] blur-[120px]" />
        <div className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[hsl(var(--primary)/0.02)] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="space-y-4 text-center sm:space-y-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[hsl(var(--primary)/0.7)] [font-family:var(--home-copy)]">
            Platform Weapons
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[0.92] tracking-[-0.025em] text-foreground [font-family:var(--home-display)]">
            Built for traders who{' '}
            <span className="block text-[hsl(var(--primary)/0.9)]">want standards, not excuses</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--primary)/0.12)] bg-[hsl(var(--card)/0.6)] backdrop-blur-sm transition-all duration-300 hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--card)/0.8)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.04)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r from-[hsl(var(--primary)/0.6)] to-[hsl(var(--primary)/0.2)] transition-all duration-500 group-hover:w-full" />

                <div className="relative flex h-full flex-col gap-4 p-6 sm:p-7">
                  <div className="relative inline-flex">
                    <div className="absolute -inset-1 rounded-xl bg-[hsl(var(--primary)/0.1)] blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary)/0.9)] shadow-sm transition-all duration-300 group-hover:border-[hsl(var(--primary)/0.45)] group-hover:bg-[hsl(var(--primary)/0.12)]">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5">
                    <h3 className="text-lg font-semibold leading-tight tracking-[-0.015em] text-foreground transition-colors duration-300 [font-family:var(--home-display)] group-hover:text-[hsl(var(--primary)/0.95)]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground/80 [font-family:var(--home-copy)] transition-colors duration-300 group-hover:text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[hsl(var(--primary)/0.5)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-xs font-medium tracking-wide [font-family:var(--home-copy)]">Learn more</span>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
