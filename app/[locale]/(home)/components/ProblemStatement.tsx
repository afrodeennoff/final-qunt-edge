'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Repeat } from 'lucide-react'

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
    <section
      id="problem"
      className="border-y border-[hsl(var(--mk-border)/0.25)] py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground/60 [font-family:var(--home-copy)]">
              The Gap
            </p>
            <h2 className="mt-3 text-[clamp(1.9rem,4.9vw,3.45rem)] font-semibold leading-[0.94] tracking-[-0.02em] text-foreground [font-family:var(--home-display)]">
              Results tell you
              <span className="block text-foreground">if you were paid, not if you were good.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[0.94rem] leading-[1.75] text-muted-foreground/75 [font-family:var(--home-copy)]">
              Average traders celebrate outcomes. Elite traders audit decisions. Qunt Edge turns your
              raw trade history into a repeatable performance system.
            </p>

            <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-foreground [font-family:var(--home-copy)]">
                Mindset Upgrade
              </p>
              <p className="mt-1 text-[0.88rem] text-foreground/80 [font-family:var(--home-copy)]">
                Promote process to first-class data. Let profit follow your standards.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {problems.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface)/0.6)] p-5 hover:border-[hsl(var(--mk-border)/0.4)] transition-colors duration-200"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/[0.06] text-destructive/80">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground [font-family:var(--home-display)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-muted-foreground/75 [font-family:var(--home-copy)]">
                    {item.desc}
                  </p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
