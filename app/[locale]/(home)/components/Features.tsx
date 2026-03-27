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
    <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-6xl space-y-8 rounded-[36px] border border-border/70 bg-background/95 p-8 shadow-[0_30px_80px_-48px_hsl(var(--foreground)/0.9)] sm:space-y-10 sm:p-10">
        <div className="space-y-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground [font-family:var(--home-copy)]">Platform Weapons</p>
          <h2 className="text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
            Built for traders who
            <span className="block text-foreground">want standards, not excuses</span>
          </h2>
        </div>
        <div className="h-px bg-border/50" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[28px] border border-border/70 bg-card/80 p-6 shadow-[0_20px_45px_-28px_hsl(var(--foreground)/0.9)] transition duration-200 hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary)/0.12)] text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">{item.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
