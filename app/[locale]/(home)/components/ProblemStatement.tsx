'use client'

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
    <section className="px-4 py-16 sm:py-20 md:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t('landing.home.problem.eyebrow')}
          </p>
          <h2 className="type-h2 mt-4 text-balance text-foreground lg:text-h1">
            {t('landing.home.problem.title')}{' '}
            <span className="text-primary">{t('landing.home.problem.accent')}</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.problem.description')}
          </p>

          <div className="mt-8 rounded-lg border border-border/60 bg-card/45 p-5 shadow-sm">
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
        </div>

        <div className="grid gap-4">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <article
                key={String(problem.title)}
                className="flex gap-4 rounded-lg border border-border/60 bg-card/50 p-5 shadow-sm transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-border/80 hover:bg-card/65"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="type-overline text-destructive/75">0{index + 1}</p>
                  <h3 className="type-h4 mt-2 text-foreground">{problem.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {problem.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
