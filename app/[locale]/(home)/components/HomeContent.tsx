import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  FileText,
  Play,
  Shield,
  Users,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/v2'
import {
  MarketingFeatureCard,
  MarketingHyperframe,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatBlock,
  marketingBodyClassName,
  marketingHeroTitleClassName,
  marketingSectionTitleClassName,
} from '@/components/layout/marketing-sections'
import { MarketingPricingSection } from '@/components/layout/marketing-pricing-section'
import { getI18n } from '@/locales/server'
import { cn } from '@/lib/utils'
import ProductDemoPlayer from './ProductDemoPlayer'
import SocialProof from './SocialProof'

interface HomeContentProps {
  locale: string
}

export default async function HomeContent({ locale }: HomeContentProps) {
  const t = await getI18n()

  const features = [
    {
      icon: <Download className="h-5 w-5" />,
      title: t('landing.home.features.feature1Title'),
      description: t('landing.home.features.feature1Description'),
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t('landing.home.features.feature2Title'),
      description: t('landing.home.features.feature2Description'),
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: t('landing.home.features.feature3Title'),
      description: t('landing.home.features.feature3Description'),
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: t('landing.home.features.feature6Title'),
      description: t('landing.home.features.feature6Description'),
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t('landing.home.features.feature5Title'),
      description: t('landing.home.features.feature5Description'),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t('landing.home.features.feature4Title'),
      description: t('landing.home.features.feature4Description'),
    },
  ]

  const stats = [
    {
      value: '35+',
      label: t('landing.home.liveStats.stat1Label'),
    },
    {
      value: '6',
      label: t('landing.home.liveStats.stat2Label'),
    },
    {
      value: '17',
      label: t('landing.home.liveStats.stat3Label'),
    },
    {
      value: 'Daily',
      label: t('landing.home.liveStats.stat4Label'),
    },
  ]

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-black selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero */}
        <MarketingSection className="pt-20 sm:pt-24 lg:pt-32" innerClassName="max-w-[1400px]">
          <div className="mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/80">
                {t('landing.hero.badge')}
              </p>
              <h1 className={`${marketingHeroTitleClassName} leading-[1.05]`}>
                {t('landing.hero.headline')}
              </h1>
              <p className={`${marketingBodyClassName} mx-auto max-w-lg text-lg leading-relaxed`}>
                {t('landing.hero.subheadline')}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                className={cn(buttonVariants({ size: 'lg' }))}
              >
                <span>{t('landing.hero.ctaPrimary')}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#product-walkthrough"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                )}
              >
                <Play className="h-4 w-4" />
                <span>{t('landing.hero.ctaSecondary')}</span>
              </a>
            </div>

            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 pt-4">
              {stats.map((stat) => (
                <MarketingStatBlock
                  key={String(stat.label)}
                  value={stat.value}
                  label={stat.label}
                  className="min-w-0 p-4 text-left sm:text-left"
                />
              ))}
            </div>
          </div>
        </MarketingSection>

        {/* Social Proof */}
        <SocialProof />

        {/* Features */}
        <MarketingSection id="features" className="py-14 lg:py-16">
          <MarketingSectionHeader
            eyebrow={t('landing.home.features.eyebrow')}
            title={
              <>
                {t('landing.home.features.title')}{' '}
                <span className="text-primary">{t('landing.home.features.highlight')}</span>
              </>
            }
            description={t('landing.home.features.description')}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <MarketingFeatureCard
                key={String(feature.title)}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </MarketingSection>

        {/* Demo */}
        <MarketingSection id="product-walkthrough" className="py-14 lg:py-16">
          <MarketingSectionHeader
            eyebrow={t('landing.home.demo.frameLabel')}
            title="See it in action"
            description="Watch how Qunt Edge helps you track, analyze, and improve your trading performance."
          />
          <div className="mx-auto mt-10 max-w-4xl">
            <MarketingHyperframe
              label={t('landing.home.demo.frameLabel')}
              status="Live audit"
              className="shadow-[0_32px_80px_-48px_oklch(0.65_0.22_260_/_0.48)]"
            >
              <ProductDemoPlayer />
            </MarketingHyperframe>
          </div>
        </MarketingSection>

        {/* Pricing */}
        <MarketingPricingSection locale={locale} />

        {/* Final CTA */}
        <MarketingSection className="pb-24 pt-16 text-center lg:pb-28">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/80">
            {t('landing.home.finalCta.eyebrow')}
          </p>
          <h2 className={`${marketingSectionTitleClassName} mx-auto mt-3 max-w-2xl`}>
            {t('landing.home.finalCta.title')}
          </h2>
          <p className={`${marketingBodyClassName} mx-auto mt-4 max-w-xl`}>
            {t('landing.home.finalCta.description')}
          </p>
          <div className="mt-6">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
              >
                <span>{t('landing.home.finalCta.primary')}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/propfirms`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto',
                )}
              >
                {t('landing.home.finalCta.secondary')}
              </Link>
            </div>
          </div>
        </MarketingSection>
      </main>
    </div>
  )
}
