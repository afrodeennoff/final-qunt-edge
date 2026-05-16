import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ButtonV2 as Button } from '@/components/ui/v2'
import {
  MarketingSection,
  marketingBodyClassName,
  marketingHeroTitleClassName,
} from '@/components/layout/marketing-sections'
import { getI18n } from '@/locales/server'

export default async function Hero({ locale }: { locale: string }) {
  const t = await getI18n()

  return (
    <MarketingSection className="pt-20 sm:pt-24 lg:pt-28" innerClassName="max-w-[980px]">
      <div className="mx-auto text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
          {t('landing.hero.badge')}
        </p>
        <h1 className={`${marketingHeroTitleClassName} mt-5`}>{t('landing.hero.headline')}</h1>
        <p className={`${marketingBodyClassName} mx-auto mt-6 max-w-2xl`}>
          {t('landing.hero.subheadline')}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href={`/${locale}/authentication?next=dashboard`}>
              {t('landing.hero.ctaPrimary')}
            </Link>
          </Button>
        </div>
      </div>
    </MarketingSection>
  )
}
