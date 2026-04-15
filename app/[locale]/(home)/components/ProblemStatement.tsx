'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Brain, RotateCcw } from 'lucide-react'
import { useTypedI18n } from '@/locales/client'

const problemIcons = [AlertTriangle, Brain, RotateCcw]

export default function ProblemStatement() {
  const t = useTypedI18n()

  const problems = [1, 2, 3].map((index) => ({
    icon: problemIcons[index - 1],
    title: t(`landing.home.problem.card${index}Title`),
    description: t(`landing.home.problem.card${index}Description`),
  }))

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 lg:py-24 md:px-6 lg:px-8">
      {/* Atmospheric glow orb */}
      <div className="pointer-events-none absolute -right-48 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="mx-auto grid max-w-[1360px] gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
        <motion.div
          className="rounded-lg border border-white/[0.06] bg-card/80 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] md:p-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.problem.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.problem.title')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('landing.home.problem.accent')}
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.problem.description')}
          </p>

          <div className="mt-8 rounded-md border border-white/[0.06] bg-primary/[0.06] p-5">
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {t('landing.home.problem.mindsetEyebrow')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  {t('landing.home.problem.mindsetDescription')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <motion.article
                key={String(problem.title)}
                className="rounded-lg border border-white/[0.06] bg-card/70 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32),0_32px_64px_-12px_rgba(0,0,0,0.90)]"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="type-h4 mt-4 text-foreground">{problem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
