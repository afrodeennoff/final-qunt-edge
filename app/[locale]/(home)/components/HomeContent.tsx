import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  FileText,
  LineChart,
  NotebookTabs,
  Target,
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

  const processSteps = [
    {
      id: '01',
      title: 'Import your trades',
      body: 'Connect broker sync or upload statements in minutes. No manual spreadsheet cleanup.',
      icon: Download,
    },
    {
      id: '02',
      title: 'See your true edge',
      body: 'Track win rate, expectancy, drawdown, and behavior patterns across sessions and setups.',
      icon: LineChart,
    },
    {
      id: '03',
      title: 'Journal and review',
      body: 'Capture execution notes, mistakes, and playbook updates directly beside each trade.',
      icon: NotebookTabs,
    },
    {
      id: '04',
      title: 'Improve with intent',
      body: 'Turn insights into action plans and tighten risk decisions before the next session.',
      icon: Target,
    },
  ]

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero */}
        <MarketingSection className="pt-20 sm:pt-24 lg:pt-32">
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
          <div className="mt-10 grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Workflow */}
        <MarketingSection id="how-it-works" className="py-8 lg:py-10">
          <MarketingSectionHeader
            eyebrow="Simple Process, Serious Results"
            title="Log. Analyze. Journal. Improve."
            description="A practical workflow built for traders who want measurable progress, not dashboard noise."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => {
              const Icon = step.icon
              return (
                <article
                  key={step.id}
                  className="rounded-xl border border-border/35 bg-card/40 p-5 transition-[opacity,background-color,border-color] hover:border-primary/30 hover:bg-card/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.14em] text-primary/80">
                      {step.id}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/45 bg-background/70 text-foreground/85">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </article>
              )
            })}
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
              className="shadow-[0_32px_80px_-48px_hsl(var(--primary)/0.5)]"
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
