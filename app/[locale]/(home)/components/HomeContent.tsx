import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Download,
  FileText,
  LineChart,
  NotebookTabs,
  Play,
  Shield,
  Target,
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
import { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy } from './LazySections'
import { ErrorBoundary } from '@/components/error-boundary'

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

  const workflowSteps = [
    {
      step: '01',
      icon: <Download className="h-5 w-5" />,
      title: t('landing.home.workflow.step1Name'),
      description: t('landing.home.workflow.step1Description'),
    },
    {
      step: '02',
      icon: <LineChart className="h-5 w-5" />,
      title: t('landing.home.workflow.step2Name'),
      description: t('landing.home.workflow.step2Description'),
    },
    {
      step: '03',
      icon: <NotebookTabs className="h-5 w-5" />,
      title: t('landing.home.workflow.step3Name'),
      description: t('landing.home.workflow.step3Description'),
    },
    {
      step: '04',
      icon: <Target className="h-5 w-5" />,
      title: t('landing.home.workflow.step4Name'),
      description: t('landing.home.workflow.step4Description'),
    },
  ]

  const testimonials = [
    {
      name: 'Futures Trader',
      quote:
        'Qunt Edge gave me a cleaner review loop. I stopped guessing and started improving session by session.',
    },
    {
      name: 'Prop Team Lead',
      quote:
        'The import and review flow is fast enough for daily use, and strict enough for serious team accountability.',
    },
    {
      name: 'Discretionary Scalper',
      quote:
        'The journal feels like a real workspace, not a marketing dashboard. That changed my consistency.',
    },
  ]

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero */}
        <MarketingSection className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                {t('landing.hero.badge')}
              </p>
              <h1 className={`${marketingHeroTitleClassName} leading-[1.02]`}>
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
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
              >
                <Play className="h-4 w-4" />
                <span>{t('landing.hero.ctaSecondary')}</span>
              </a>
            </div>
          </div>
        </MarketingSection>

        {/* Social Proof */}
        <ErrorBoundary fallback={null}>
          <SocialProofLazy />
        </ErrorBoundary>

        {/* Features */}
        <MarketingSection id="features" className="py-16 lg:py-20">
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
          <div className="mt-12 grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <MarketingSection id="how-it-works" className="py-16 lg:py-20">
          <MarketingSectionHeader
            eyebrow={t('landing.home.workflow.eyebrow')}
            title={t('landing.home.workflow.title')}
            description={t('landing.home.workflow.description')}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((step) => (
              <MarketingStepCard
                key={step.step}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </MarketingSection>

        {/* Demo */}
        <MarketingSection id="product-walkthrough" className="py-16 lg:py-20">
          <MarketingSectionHeader
            eyebrow={t('landing.home.demo.eyebrow')}
            title={t('landing.home.demo.title')}
            description={t('landing.home.demo.description')}
          />
          <div className="mx-auto mt-12 max-w-4xl">
            <MarketingHyperframe
              label={t('landing.home.demo.frameLabel')}
              status="Live audit"
              className="shadow-[0_32px_80px_-48px_hsl(var(--primary)/0.5)]"
            >
              <ProductDemoPlayer />
            </MarketingHyperframe>
          </div>
        </MarketingSection>

        {/* Testimonials */}
        <MarketingSection id="testimonials" className="py-16 lg:py-20">
          <MarketingSectionHeader
            eyebrow="Trader feedback"
            title="Trusted by serious traders"
            description="Built for disciplined review, repeatable execution, and long-term consistency."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="group rounded-2xl border border-[oklch(0.65_0.22_260_/_0.09)] bg-[linear-gradient(180deg,oklch(0.062_0.012_260_/_0.82)_0%,oklch(0.054_0.01_260_/_0.76)_100%)] p-6 text-left shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_16px_32px_-26px_rgba(0,0,0,0.62)] transition-[border-color,background-color] duration-200 hover:border-[oklch(0.65_0.22_260_/_0.13)] hover:bg-[oklch(0.068_0.012_260_/_0.92)]"
              >
                <p className="text-[15px] leading-[1.65] text-foreground/80 italic">{item.quote}</p>
                <div className="mt-5 border-t border-[oklch(0.65_0.22_260_/_0.06)] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                    {item.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </MarketingSection>

        {/* Pricing */}
        <MarketingPricingSection locale={locale} />

        {/* Secondary Value */}
        <ErrorBoundary fallback={null}>
          <TrustAndProofLazy />
        </ErrorBoundary>

        {/* FAQ */}
        <ErrorBoundary fallback={null}>
          <FAQSectionLazy />
        </ErrorBoundary>

        {/* Final CTA */}
        <MarketingSection className="pb-24 pt-16 text-center lg:pb-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
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
