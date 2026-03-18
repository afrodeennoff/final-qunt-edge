'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

const steps = [
  { name: 'Sync Data', text: 'Ingest broker fills, account history, and journal context into one timeline.' },
  { name: 'Define Rules', text: 'Capture your setup criteria, risk constraints, and expected behavior standards.' },
  { name: 'Review Session', text: 'Compare planned intent versus real execution to expose decision-quality gaps.' },
  { name: 'Detect Drift', text: 'Flag emotional, sizing, and discipline drift before it compounds.' },
  { name: 'Improve Weekly', text: 'Turn findings into clear interventions and measure compliance momentum.' },
]

const stepNumberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: { 
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/80 [font-family:var(--home-copy)]">How It Works</p>
          <h2 className="mt-2 text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
            A repeatable pipeline
            <span className="block text-foreground">from data to better decisions</span>
          </h2>
        </div>

        <div className="relative grid gap-4 md:grid-cols-5">
          <motion.div 
            className="pointer-events-none absolute left-[10%] right-[10%] top-6 hidden h-px origin-left bg-[hsl(var(--mk-border)/0.35)] md:block"
            variants={connectorVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0 }}
          />
          {steps.map((step, i) => (
            <motion.article
              key={step.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="marketing-panel relative rounded-2xl p-5 text-center"
            >
              <motion.div 
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-sm font-semibold text-foreground [font-family:var(--home-display)]"
                variants={stepNumberVariants}
              >
                0{i + 1}
              </motion.div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] [font-family:var(--home-copy)]">{step.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
