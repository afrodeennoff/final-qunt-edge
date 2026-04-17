'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  unifiedBodyCopyClassName,
  unifiedGhostActionClassName,
  unifiedPrimaryActionClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  const t = useI18n()

  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={cn(unifiedSectionPanelClassName, 'px-6 py-14 text-center md:px-10 md:py-16')}>
          <h2 className="text-balance text-[clamp(2.2rem,4.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.05em] text-foreground">
            {t('landing.home.finalCta.titlePrefix')}{' '}
            <span className="line-through decoration-muted-foreground/40 decoration-2">
              {t('landing.home.finalCta.titleStrike')}
            </span>{' '}
            {t('landing.home.finalCta.titleBridge')}{' '}
            <span className="text-primary">{t('landing.home.finalCta.titleHighlight')}</span>
            {t('landing.home.finalCta.titleSuffix')}
          </h2>

          <p className={cn(unifiedBodyCopyClassName, 'mx-auto mt-5 max-w-2xl')}>
            {t('landing.home.finalCta.description')}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/authentication?next=dashboard`} className={unifiedPrimaryActionClassName}>
              {t('landing.home.finalCta.primary')}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link href={`/${locale}/propfirms`} className={unifiedGhostActionClassName}>
              {t('landing.home.finalCta.secondary')}
            </Link>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('landing.home.finalCta.footnote')}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
