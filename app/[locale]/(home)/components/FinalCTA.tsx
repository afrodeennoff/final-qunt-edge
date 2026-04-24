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
    <MarketingSection className="pb-28 lg:pb-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
          {t('landing.home.finalCta.eyebrow')}
        </p>
        <h2 className={`${marketingSectionTitleClassName} mt-4`}>
          {t('landing.home.finalCta.title')}
        </h2>
        <p className={`${marketingBodyClassName} mx-auto mt-5 max-w-xl`}>
          {t('landing.home.finalCta.description')}
        </p>

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
