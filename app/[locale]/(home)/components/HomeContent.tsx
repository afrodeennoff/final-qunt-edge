import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle2, Shield, Sparkles } from 'lucide-react'
import { ButtonV2, CardV2, CardV2Content, CardV2Description, CardV2Title } from '@/components/ui/v2'

const coreCapabilities = [
  {
    title: 'Review execution, not just PnL',
    body: 'See where rule quality broke down across entry timing, sizing discipline, and session context before it becomes a larger drawdown problem.',
    icon: BarChart3,
  },
  {
    title: 'Catch behavior drift early',
    body: 'Identify repeat mistakes, emotional overreach, and session-to-session inconsistency with a tighter post-trade review loop.',
    icon: Sparkles,
  },
  {
    title: 'Keep the operating system simple',
    body: 'Journal, diagnostics, prop-firm research, and trader workflow tools live in one dark interface instead of scattered tabs.',
    icon: Shield,
  },
]

const workflow = [
  'Import trades or log them manually.',
  'Review the session with a ranked execution diagnosis.',
  'Turn the next session into a cleaner plan with less guesswork.',
]

export default function HomeContent({ locale }: { locale: string }) {
  return (
    <main className="relative mx-auto w-full max-w-[1240px] px-4 pb-20 pt-6 sm:px-6 sm:pb-24 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(90,139,255,0.18)_0%,_rgba(90,139,255,0)_72%)] blur-3xl" />
        <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-16">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
            <span className="h-2 w-2 rounded-full bg-v2-accent" />
            Dark review system for serious discretionary traders
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-white">
              Minimal surface.
              <br />
              Sharper trade review.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Qunt Edge gives you one restrained dark workspace to audit execution quality, spot behavioral drift,
              and tighten your next session without piling on more noise.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonV2 variant="solid" size="lg" className="rounded-full px-8">
              <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center gap-2">
                Start Free Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ButtonV2>
            <ButtonV2 variant="ghost" size="lg" className="rounded-full border border-white/12 bg-white/[0.03] px-8 text-white hover:bg-white/[0.06]">
              <Link href={`/${locale}/leaderboard`}>See Public Leaderboard</Link>
            </ButtonV2>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-white/54">
            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">Trade diagnostics</span>
            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">Journal workflow</span>
            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">Prop-firm research</span>
          </div>
        </div>

        <CardV2 variant="glass" hover={false} className="overflow-hidden rounded-[28px] border-white/10 bg-black/40 p-0">
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Session Snapshot</p>
          </div>
          <CardV2Content className="grid gap-4 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Rule Adherence" value="94%" tone="text-white" />
              <Metric label="Behavior Drift" value="-42%" tone="text-v2-accent" />
              <Metric label="Review Time" value="<10m" tone="text-white" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Post-session diagnosis</p>
                  <p className="mt-1 text-sm text-white/54">Execution quality ranked by the issues that matter first.</p>
                </div>
                <span className="rounded-full border border-v2-accent/30 bg-v2-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-v2-accent">
                  Live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['A setup quality', 'Patient entries, clean structure confirmation'],
                  ['B risk discipline', 'Sizing stayed within plan across the session'],
                  ['C emotional control', 'One late revenge attempt after a stop-out'],
                ].map(([grade, body]) => (
                  <div key={grade} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                      {grade}
                    </div>
                    <p className="text-sm leading-6 text-white/62">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardV2Content>
        </CardV2>
      </section>

      <section id="features" className="grid gap-4 border-y border-white/8 py-8 sm:grid-cols-3">
        {[
          ['One interface', 'No theme switches, no competing visual systems, no extra chrome.'],
          ['One review loop', 'Import, inspect, and plan the next session in the same workspace.'],
          ['One visual language', 'Dark surfaces, quieter borders, and fewer distractions.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/56">{body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <CardV2 variant="glass" hover={false} className="rounded-[26px] border-white/10 bg-white/[0.03]">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Core Workflow</p>
            <CardV2Title className="mt-4 text-2xl text-white sm:text-3xl">
              A smaller homepage, a tighter product story.
            </CardV2Title>
            <CardV2Description className="mt-4 max-w-xl text-base leading-7 text-white/60">
              The public experience now points to a single promise: clean review infrastructure for traders who want
              less noise and more clarity.
            </CardV2Description>
            <div className="mt-6 space-y-4">
              {workflow.map((step) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-v2-accent" />
                  <p className="text-sm leading-6 text-white/66">{step}</p>
                </div>
              ))}
            </div>
          </CardV2Content>
        </CardV2>

        <div className="grid gap-4 sm:grid-cols-3">
          {coreCapabilities.map((capability) => {
            const Icon = capability.icon
            return (
              <CardV2 key={capability.title} variant="glass" className="rounded-[26px] border-white/10 bg-white/[0.03]">
                <CardV2Content className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Icon className="h-5 w-5 text-v2-accent" />
                  </div>
                  <CardV2Title className="mt-5 text-xl text-white">{capability.title}</CardV2Title>
                  <CardV2Description className="mt-3 text-sm leading-7 text-white/58">
                    {capability.body}
                  </CardV2Description>
                </CardV2Content>
              </CardV2>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 py-4 lg:grid-cols-[1fr_0.9fr]">
        <CardV2 variant="glass" hover={false} className="rounded-[30px] border-white/10 bg-white/[0.03]">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Explore</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <QuickLink
                href={`/${locale}/deals`}
                title="Deals"
                body="Compare current prop-firm offers in the same dark visual system."
              />
              <QuickLink
                href={`/${locale}/propfirms`}
                title="Prop Firms"
                body="Screen firms, structures, and fit before you buy another evaluation."
              />
              <QuickLink
                href={`/${locale}/support`}
                title="Support"
                body="Reach the team without leaving the main product flow."
              />
            </div>
          </CardV2Content>
        </CardV2>

        <CardV2 variant="elevated" hover={false} className="rounded-[30px] border-white/12 bg-white/[0.04]">
          <CardV2Content className="flex h-full flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Start Here</p>
              <CardV2Title className="mt-4 text-3xl text-white">Audit your next session in a darker, cleaner workspace.</CardV2Title>
              <CardV2Description className="mt-4 text-base leading-7 text-white/60">
                Built for traders who want fewer visual conflicts and a more disciplined review loop.
              </CardV2Description>
            </div>
            <ButtonV2 variant="solid" size="lg" className="mt-8 rounded-full px-8">
              <Link href={`/${locale}/authentication?next=dashboard`} className="flex items-center gap-2">
                Open Qunt Edge
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ButtonV2>
          </CardV2Content>
        </CardV2>
      </section>
    </main>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-[-0.03em] ${tone}`}>{value}</p>
    </div>
  )
}

function QuickLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/8 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{body}</p>
    </Link>
  )
}
