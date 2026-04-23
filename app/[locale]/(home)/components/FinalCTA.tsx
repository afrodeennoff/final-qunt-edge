import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { unifiedPrimaryActionClassName } from '@/components/layout/unified-page-recipes'
import { getI18n } from '@/locales/server'
import { ScrollRevealSection } from './ScrollReveal'

interface FinalCTAProps {
  locale: string
}

export default async function FinalCTA({ locale }: FinalCTAProps) {
  const t = await getI18n()

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <ScrollRevealSection className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t('landing.home.finalCta.titlePrefix')}{' '}
          <span className="text-primary">{t('landing.home.finalCta.titleHighlight')}</span>
          {t('landing.home.finalCta.titleSuffix')}
        </h2>

        <div className="mt-8">
          <Link href={`/${locale}/authentication?next=dashboard`} className={unifiedPrimaryActionClassName}>
            {t('landing.home.finalCta.primary')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('landing.home.finalCta.footnote')}
        </p>
      </ScrollRevealSection>
    </section>
  )
}
