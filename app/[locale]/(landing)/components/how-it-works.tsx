'use client'
import { motion } from 'motion/react'

export default function HowItWorks() {
  const steps = [
    {
      name: 'Raw Ingestion',
      desc: "Zero manual input. We hook directly into your broker's API to pull raw execution logs.",
    },
    {
      name: 'Intent Locking',
      desc: 'You define the setup before the session. If you take a trade outside these parameters, we flag it.',
    },
    {
      name: 'Clinical Audit',
      desc: 'Our engine separates outcome (luck) from process (skill). Did you follow the plan?',
    },
    {
      name: 'Loop Detection',
      desc: 'AI identifies the exact moment your psychology shifted (e.g., after 2 consecutive losses).',
    },
    {
      name: 'Forced Adaptation',
      desc: 'The system locks you out or mandates size reduction until stability is restored.',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-border bg-background px-4 py-24 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-6 overflow-hidden rounded-[2.2rem] border-0 bg-muted/40 p-6 shadow-[0_0_0_0.5px_hsl(var(--primary)/0.06),0_28px_70px_-42px_rgba(0,0,0,0.96)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border-0 bg-muted/40 p-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              Optimization Pipeline
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-5 text-3xl font-[350] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              A closed loop built to turn trading behavior into something measurable.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-lg text-base leading-[1.8] text-foreground"
            >
              The product captures intent, audits execution, and forces review into a repeatable
              rhythm instead of leaving performance buried in screenshots and hindsight.
            </motion.p>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0 relative">
            <div className="hidden lg:block absolute top-8 left-[8%] w-[84%] h-px z-0 bg-muted/40" />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '84%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block absolute top-8 left-[8%] h-px z-0 bg-gradient-to-r from-primary via-primary/40 to-[hsl(var(--primary))]"
            />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative z-10 min-w-[280px] flex-shrink-0 snap-center rounded-xl border-0 bg-muted/40 p-4 lg:min-w-0"
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-0 bg-background/50">
                    <span className="font-mono text-xs font-bold text-foreground sm:text-sm">
                      0{i + 1}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>

                <div className="px-1">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-foreground/70">
                    {step.name}
                  </h3>
                  <p className="text-sm leading-[1.8] text-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4 lg:hidden">
            {steps.map((_, i) => (
              <button
                key={i}
                className="w-2 h-2 rounded-full bg-border/40 hover:bg-border/60 transition-colors"
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
