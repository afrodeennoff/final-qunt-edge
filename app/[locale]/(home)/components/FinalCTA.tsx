import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import {
  MarketingSection,
  marketingBodyClassName,
  marketingSectionTitleClassName,
} from '@/components/layout/marketing-sections'
import { getI18n } from '@/locales/server'

interface FinalCTAProps {
  locale: string
}

export default async function FinalCTA({ locale }: FinalCTAProps) {
  const t = await getI18n()

  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={cn(unifiedSectionPanelClassName, 'px-6 py-10 text-center md:px-10 md:py-14')}>
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
      </div>
    </MarketingSection>
  )
}
