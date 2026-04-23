import { Link2, BarChart3, TrendingUp } from 'lucide-react'
import {
  unifiedInsetPanelClassName,
  unifiedSectionEyebrowClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { getTypedI18n } from '@/locales/server'
import { ScrollReveal } from './ScrollReveal'

const stepIcons = [Link2, BarChart3, TrendingUp]

export default async function HowItWorks() {
  const t = await getTypedI18n()

  const steps = [1, 2, 3].map((index) => ({
    name: t(`landing.home.workflow.step${index}Name`),
    description: t(`landing.home.workflow.step${index}Description`),
    icon: stepIcons[index - 1],
  }))

  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1360px] space-y-10">
        <div className="text-center">
          <p className={unifiedSectionEyebrowClassName}>{t('landing.home.workflow.eyebrow')}</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t('landing.home.workflow.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <ScrollReveal
                key={String(step.name)}
                as="article"
                className={cn(unifiedInsetPanelClassName, 'p-8 text-center')}
                delay={index * 0.1}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/18 bg-primary/10 text-sm font-semibold text-primary">
                  0{index + 1}
                </div>
                <div className="mt-4 flex justify-center text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {step.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
