import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
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
    <MarketingSection className="pt-24 sm:pt-28 lg:pt-36" innerClassName="max-w-[980px]">
      <div className="mx-auto text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
          {t('landing.hero.badge')}
        </p>
        <h1 className={`${marketingHeroTitleClassName} mt-5`}>{t('landing.hero.headline')}</h1>
        <p className={`${marketingBodyClassName} mx-auto mt-6 max-w-2xl`}>
          {t('landing.hero.subheadline')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href={`/${locale}/authentication?next=dashboard`}>
              {t('landing.hero.ctaPrimary')}
            </Link>
            <a href="#how-it-works" className={unifiedGhostActionClassName}>
              {t('landing.hero.ctaSecondary')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d3 flex flex-wrap gap-2.5">
            {proofPills.map((item) => (
              <span key={item} className={cn(unifiedInsetPanelClassName, 'px-3.5 py-2 text-xs text-muted-foreground')}>
                {item}
              </span>
            ))}
          </div>

          <div className="animate-fade-up-smooth animate-fade-up-smooth-d4 grid gap-3 sm:grid-cols-2 xl:max-w-[42rem]">
            <div className={cn(unifiedInsetPanelClassName, 'space-y-3 p-4 sm:p-5')}>
              <p className={unifiedInfoLabelClassName}>{t('landing.home.hero.integrationsTitle')}</p>
              <div className="flex flex-wrap gap-2">
                {integrations.map((integration) => (
                  <span
                    key={String(integration)}
                    className="rounded-full border border-border/45 bg-background/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>

            <div className={cn(unifiedInsetPanelClassName, 'space-y-3 p-4 sm:p-5')}>
              <p className={unifiedInfoLabelClassName}>Review stack</p>
              <div className="space-y-3">
                {capabilityCards.map((card, index) => (
                  <div
                    key={String(card.title)}
                    className={cn(
                      'space-y-1.5',
                      index < capabilityCards.length - 1 && 'border-b border-border/40 pb-3',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Dot className="h-4 w-4 text-primary" />
                      <p className={cn(unifiedInfoValueClassName, 'text-[15px]')}>{card.title}</p>
                    </div>
                    <p className="text-sm leading-[1.55] text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up-smooth animate-fade-up-smooth-d5">
          <UnifiedHeroMedia
            screenshot={<DashboardPreview />}
            overlay={<SignalOverlay />}
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
    </MarketingSection>
  )
}
