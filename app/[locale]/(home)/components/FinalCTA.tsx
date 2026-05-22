'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ButtonV2 as Button, CardV2 as Card } from '@/components/ui/v2'
import { MarketingSection } from '@/components/layout/marketing-sections'
import { useTypedI18n } from '@/locales/client'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  const t = useTypedI18n()

  return (
    <MarketingSection className="py-8 sm:py-12 lg:py-16" innerClassName="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card variant="elevated" className="px-6 py-10 text-center md:px-10 md:py-14">
          <h2 className="text-balance text-[clamp(2.2rem,4.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.05em] text-foreground">
            {t('landing.home.finalCta.titlePrefix')}{' '}
            <span className="line-through decoration-muted-foreground/40 decoration-2">
              {t('landing.home.finalCta.titleStrike')}
            </span>{' '}
            {t('landing.home.finalCta.titleBridge')}{' '}
            <span className="text-primary">{t('landing.home.finalCta.titleHighlight')}</span>
            {t('landing.home.finalCta.titleSuffix')}
          </h2>

          <div className="mt-8">
            <Button asChild size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href={`/${locale}/authentication?next=dashboard`}>
                {t('landing.home.finalCta.primary')}
              </Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    </MarketingSection>
  )
}
