import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Brain,
  Download,
  FileText,
  Gauge,
  Link2,
  Play,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/v2'
import {
  MarketingFeatureCard,
  MarketingHyperframe,
  MarketingSection,
  MarketingSectionHeader,
  MarketingStatBlock,
  MarketingStepCard,
  marketingBodyClassName,
  marketingHeroTitleClassName,
  marketingSectionTitleClassName,
} from '@/components/layout/marketing-sections'
import { MarketingPricingSection } from '@/components/layout/marketing-pricing-section'
import { getI18n } from '@/locales/server'
import { cn } from '@/lib/utils'
import ProductDemoPlayer from './ProductDemoPlayer'

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

  const capabilities = [
    {
      title: t('landing.home.hero.capability1Title'),
      description: t('landing.home.hero.capability1Description'),
    },
    {
      title: t('landing.home.hero.capability2Title'),
      description: t('landing.home.hero.capability2Description'),
    },
    {
      title: t('landing.home.hero.capability3Title'),
      description: t('landing.home.hero.capability3Description'),
    },
  ]

  const problemCards = [
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t('landing.home.problem.card1Title'),
      description: t('landing.home.problem.card1Description'),
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: t('landing.home.problem.card2Title'),
      description: t('landing.home.problem.card2Description'),
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: t('landing.home.problem.card3Title'),
      description: t('landing.home.problem.card3Description'),
    },
  ]

  const steps = [
    {
      icon: <Link2 className="h-5 w-5" />,
      title: t('landing.home.workflow.step1Name'),
      description: t('landing.home.workflow.step1Description'),
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t('landing.home.workflow.step2Name'),
      description: t('landing.home.workflow.step2Description'),
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: t('landing.home.workflow.step3Name'),
      description: t('landing.home.workflow.step3Description'),
    },
  ]

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-black selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex min-w-0 flex-col">
        <MarketingSection className="pt-24 sm:pt-28 lg:pt-36" innerClassName="max-w-[1180px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
                {t('landing.hero.badge')}
              </p>
              <h1 className={`${marketingHeroTitleClassName} mt-5`}>
                {t('landing.hero.headline')}
              </h1>
              <p className={`${marketingBodyClassName} mt-6 max-w-xl`}>
                {t('landing.hero.subheadline')}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/authentication?next=dashboard`}
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
                >
                  <span>{t('landing.hero.ctaPrimary')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#product-walkthrough"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'w-full sm:w-auto',
                  )}
                >
                  <Play className="h-4 w-4" />
                  <span>{t('landing.hero.ctaSecondary')}</span>
                </a>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <MarketingStatBlock
                    key={String(stat.label)}
                    value={stat.value}
                    label={stat.label}
                    className="min-w-0 p-4 text-left sm:text-left"
                  />
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {capabilities.map((capability) => (
                  <div
                    key={String(capability.title)}
                    className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{capability.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <MarketingHyperframe
              id="product-walkthrough"
              label={t('landing.home.demo.frameLabel')}
              status="Live audit"
              className="shadow-[0_26px_70px_-46px_oklch(0.65_0.22_260_/_0.55)]"
            >
              <ProductDemoPlayer />
            </MarketingHyperframe>
          </div>
        </MarketingSection>

        <MarketingSection className="py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
                {t('landing.home.problem.eyebrow')}
              </p>
              <h2 className={`${marketingSectionTitleClassName} mt-4 max-w-3xl`}>
                {t('landing.home.problem.title')}{' '}
                <span className="text-primary">{t('landing.home.problem.accent')}</span>
              </h2>
            </div>
            <p className={`${marketingBodyClassName} max-w-2xl lg:ml-auto`}>
              {t('landing.home.problem.description')}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {problemCards.map((card) => (
              <MarketingFeatureCard
                key={String(card.title)}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection id="features" className="py-20 lg:py-24">
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
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <MarketingSection className="py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-start">
            <MarketingSectionHeader
              eyebrow={t('landing.home.workflow.eyebrow')}
              title={t('landing.home.workflow.title')}
              description={t('landing.home.workflow.description')}
              align="left"
              className="m-0"
            />
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <MarketingStepCard
                  key={String(step.title)}
                  step={`0${index + 1}`}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.65_0.22_260_/_0.08)] text-primary">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {t('landing.home.workflow.signalTitle')}
              </h3>
              <p className={`${marketingBodyClassName} mt-2 text-sm`}>
                {t('landing.home.workflow.signalDescription')}
              </p>
            </div>
            <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.035)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.76_0.2_145_/_0.18)] bg-[oklch(0.76_0.2_145_/_0.08)] text-[oklch(0.76_0.2_145)]">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {t('landing.home.workflow.cadenceTitle')}
              </h3>
              <p className={`${marketingBodyClassName} mt-2 text-sm`}>
                {t('landing.home.workflow.cadenceDescription')}
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingPricingSection locale={locale} />

        <MarketingSection className="pb-28 pt-20 text-center lg:pb-36">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/88">
            {t('landing.home.finalCta.eyebrow')}
          </p>
          <h2 className={`${marketingSectionTitleClassName} mx-auto mt-4 max-w-3xl`}>
            {t('landing.home.finalCta.title')}
          </h2>
          <p className={`${marketingBodyClassName} mx-auto mt-5 max-w-2xl`}>
            {t('landing.home.finalCta.description')}
          </p>
          <div className="mt-8">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
              >
                <span>{t('landing.home.finalCta.primary')}</span>
                <ArrowRight className="h-4 w-4" />
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
