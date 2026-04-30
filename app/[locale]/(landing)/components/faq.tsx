'use client'

import { useI18n } from '@/locales/client'

export default function FAQ() {
  const t = useI18n()

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="mx-6 overflow-hidden rounded-2xl border frost-border-7 frost-gradient-card p-6 shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_28px_70px_-42px_rgba(0,0,0,0.96)]">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/35">
                FAQ
              </p>
              <h2 className="mt-5 text-3xl font-[350] tracking-[-0.05em] text-foreground sm:text-4xl">
                {t('faq.heading')}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-[1.8] text-foreground/60">
                The essentials traders ask before they connect accounts, switch workflows, or
                evaluate the platform for team use.
              </p>
            </div>
            <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.06)] frost-bg-dim p-5">
              <div className="space-y-4">
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question1')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer1')}
                  </p>
                </details>
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question2')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer2')}
                  </p>
                </details>
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question3')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer3')}
                  </p>
                </details>
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question4')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer4')}
                  </p>
                </details>
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question5')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer5')}
                  </p>
                </details>
                <details className="rounded-xl border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.68)] p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {t('faq.question6')}
                  </summary>
                  <p className="mt-3 text-sm leading-[1.75] text-foreground/70">
                    {t('faq.answer6')}
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
