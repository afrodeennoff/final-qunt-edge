'use client'

import { motion } from 'framer-motion'
import { InteractiveWrapper } from '@/components/animation/interactive'
import { MOTION_EASE } from './_constants'

const steps = [
  { name: 'Sync Data', text: 'Ingest broker fills, account history, and journal context into one timeline.' },
  { name: 'Define Rules', text: 'Capture your setup criteria, risk constraints, and expected behavior standards.' },
  { name: 'Review Session', text: 'Compare planned intent versus real execution to expose decision-quality gaps.' },
  { name: 'Detect Drift', text: 'Flag emotional, sizing, and discipline drift before it compounds.' },
  { name: 'Improve Weekly', text: 'Turn findings into clear interventions and measure compliance momentum.' },
]

const lineGradient =
  'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7), transparent)'
const lineMask =
  'linear-gradient(90deg, black 0%, black 80%, transparent 100%)'

const lineGradientVertical =
  'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)/0.7), transparent)'
const lineMaskVertical =
  'linear-gradient(180deg, black 0%, black 80%, transparent 100%)'

const ease = MOTION_EASE as unknown as number[]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-[var(--frost-border)] bg-[var(--surface-card)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
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
            className="pointer-events-none absolute left-[10%] right-[10%] top-6 h-px origin-left"
            style={{
              background: lineGradient,
              mask: lineMask,
              WebkitMask: lineMask,
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          />
          {steps.map((step, i) => (
            <InteractiveWrapper key={step.name} hover="scale">
              <motion.article
                className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5 hover:border-[var(--frost-border-strong)] transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--accent-blue)]/30 bg-[oklch(0.08_0_0)]">
                    <span className="text-sm font-bold font-mono text-[var(--accent-blue)]">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] [font-family:var(--home-copy)]">
                    {step.name}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                  {step.text}
                </p>
              </motion.article>
            </InteractiveWrapper>
          ))}
        </div>

        <div className="relative flex flex-col gap-4 md:hidden">
          <motion.div
            className="pointer-events-none absolute bottom-[8%] left-6 top-[8%] w-px origin-top"
            style={{
              background: lineGradientVertical,
              mask: lineMaskVertical,
              WebkitMask: lineMaskVertical,
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          />
          {steps.map((step, i) => (
            <InteractiveWrapper key={`mobile-${step.name}`} hover="scale">
              <motion.article
                className="rounded-2xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5 hover:border-[var(--frost-border-strong)] transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--accent-blue)]/30 bg-[oklch(0.08_0_0)]">
                    <span className="text-sm font-bold font-mono text-[var(--accent-blue)]">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] [font-family:var(--home-copy)]">
                    {step.name}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
                  {step.text}
                </p>
              </motion.article>
            </InteractiveWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
