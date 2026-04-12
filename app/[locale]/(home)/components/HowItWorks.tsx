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
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_24px_70px_-42px_rgba(0,0,0,0.96)] lg:sticky lg:top-28 lg:p-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.65_0.22_260/0.12),transparent_44%),radial-gradient(circle_at_bottom_right,oklch(0.82_0.185_155/0.06),transparent_34%)]" />
            <div className="relative">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-foreground/40 [font-family:var(--home-copy)]">
                How It Works
              </p>
              <h2 className="mt-4 text-[clamp(2.1rem,4.8vw,4rem)] font-[350] leading-[0.92] tracking-[-0.05em] text-foreground/95 [font-family:var(--home-display)]">
                A precision loop for traders who want repeatable improvement.
              </h2>
              <p className="mt-5 max-w-xl text-[0.96rem] leading-[1.8] text-foreground/58 [font-family:var(--home-copy)]">
                Qunt Edge turns disconnected trade logs, emotional hindsight, and broker noise into a single operating rhythm.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Signal</p>
                  <p className="mt-2 text-sm leading-[1.7] text-foreground/66">
                    Every session is translated into visible rules, drift, and compliance data.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/34">Cadence</p>
                  <p className="mt-2 text-sm leading-[1.7] text-foreground/66">
                    The workflow stays lightweight enough to run every day, not just after drawdowns.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[oklch(0.035_0.005_264)] p-4 shadow-[0_0_0_0.5px_rgba(180,210,255,0.05),0_24px_60px_-40px_rgba(0,0,0,0.96)] sm:p-5 lg:p-6">
            <motion.div
              className="pointer-events-none absolute left-8 right-8 top-10 hidden h-px origin-left lg:block"
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
            <motion.div
              className="pointer-events-none absolute bottom-8 left-8 top-8 w-px origin-top lg:hidden"
              style={{
                background: lineGradientVertical,
                mask: lineMaskVertical,
                WebkitMask: lineMaskVertical,
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease, delay: 0.15 }}
            />

            <div className="relative grid gap-3 lg:grid-cols-5">
              {steps.map((step, i) => (
                <InteractiveWrapper key={step.name} hover="scale">
                  <motion.article
                    className="relative h-full rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: i * 0.1 }}
                  >
                    <div className="mb-8 flex items-center justify-between gap-3">
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-white/[0.10] bg-black/55 shadow-[0_0_18px_oklch(0.65_0.22_260/0.16)]">
                        <span className="text-sm font-bold font-mono text-[var(--accent-blue)]">
                          0{i + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/28">
                        Stage {i + 1}
                      </span>
                    </div>
                    <h3 className="text-[0.88rem] font-semibold uppercase tracking-[0.14em] text-foreground/86 [font-family:var(--home-copy)]">
                      {step.name}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.75] text-foreground/62 [font-family:var(--home-copy)]">
                      {step.text}
                    </p>
                  </motion.article>
                </InteractiveWrapper>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
