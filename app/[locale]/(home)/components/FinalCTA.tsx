'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/locales/client'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  const t = useI18n()

  return (
    <section className="relative bg-muted/20 px-4 py-16 sm:py-20 lg:py-24 md:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-lg border border-white/[0.06] bg-card/80 px-6 py-14 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)] md:px-10 md:py-16">
          <h2 className="text-balance text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.05em] text-foreground [font-family:var(--home-display)]">
            {t('landing.home.finalCta.titlePrefix')}{' '}
            <span className="line-through decoration-muted-foreground/40 decoration-2">
              {t('landing.home.finalCta.titleStrike')}
            </span>{' '}
            {t('landing.home.finalCta.titleBridge')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('landing.home.finalCta.titleHighlight')}
            </span>
            {t('landing.home.finalCta.titleSuffix')}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('landing.home.finalCta.description')}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 rounded-full px-8 text-sm font-semibold">
              <Link href={`/${locale}/authentication?next=dashboard`}>
                {t('landing.home.finalCta.primary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-white/[0.06] bg-background/70 px-8 text-sm font-medium text-foreground hover:bg-background"
            >
              <Link href={`/${locale}/propfirms`}>{t('landing.home.finalCta.secondary')}</Link>
            </Button>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('landing.home.finalCta.footnote')}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
