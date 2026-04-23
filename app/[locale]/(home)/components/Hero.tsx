import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { UnifiedHeroMedia } from '@/components/layout/unified-hero-media'
import {
  unifiedPrimaryActionClassName,
  unifiedGhostActionClassName,
} from '@/components/layout/unified-page-recipes'
import { getI18n } from '@/locales/server'
import DashboardPreview from './DashboardPreview'

export default async function Hero({ locale }: { locale: string }) {
  const t = await getI18n()

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div className="mx-auto max-w-[1360px]">
        {/* Centered copy block */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t('landing.hero.headline')}{' '}
            <span className="text-primary">{t('landing.hero.headlineAccent')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            {t('landing.hero.subheadline')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/authentication?next=dashboard`} className={unifiedPrimaryActionClassName}>
              {t('landing.hero.ctaPrimary')}
            </Link>
            <a href="#how-it-works" className={unifiedGhostActionClassName}>
              {t('landing.hero.ctaSecondary')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 animate-fade-up-smooth sm:mt-20">
          <UnifiedHeroMedia
            screenshot={<DashboardPreview />}
            caption={
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/45 bg-background/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                Live review system
              </div>
            }
            className="min-h-[560px]"
          />
        </div>
      </div>
    </section>
  )
}
