'use client'

import { motion } from 'framer-motion'

const steps = [
  { name: 'Sync Data', text: 'Ingest broker fills, account history, and journal context into one timeline.' },
  { name: 'Define Rules', text: 'Capture your setup criteria, risk constraints, and expected behavior standards.' },
  { name: 'Review Session', text: 'Compare planned intent versus real execution to expose decision-quality gaps.' },
  { name: 'Detect Drift', text: 'Flag emotional, sizing, and discipline drift before it compounds.' },
  { name: 'Improve Weekly', text: 'Turn findings into clear interventions and measure compliance momentum.' },
]

const ease = [0.25, 0.46, 0.45, 0.94]

export default function HowItWorks() {
  return (
    <section className="relative border-y border-border/30 bg-card/20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-foreground/80 [font-family:var(--home-copy)]">
            How It Works
          </p>
          <h2 className="mt-2 text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
            A repeatable pipeline
            <span className="block text-foreground">from data to better decisions</span>
          </h2>
        </div>

        <div className="relative hidden md:grid md:grid-cols-5 md:gap-4">
          <motion.div
            className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] h-px origin-left bg-[hsl(var(--mk-border)/0.35)]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          />
          {steps.map((step, i) => (
            <motion.article
              key={step.name}
              className="marketing-panel relative rounded-2xl p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-sm font-semibold text-foreground [font-family:var(--home-display)]">
                0{i + 1}
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] [font-family:var(--home-copy)]">
                {step.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                {step.text}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="relative flex flex-col gap-4 md:hidden">
          <motion.div
            className="pointer-events-none absolute bottom-[8%] left-[22px] top-[8%] w-px origin-top bg-[hsl(var(--mk-border)/0.35)]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          />
          {steps.map((step, i) => (
            <motion.article
              key={step.name}
              className="marketing-panel relative rounded-2xl p-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-sm font-semibold text-foreground [font-family:var(--home-display)]">
                  0{i + 1}
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] [font-family:var(--home-copy)]">
                  {step.name}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                {step.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
