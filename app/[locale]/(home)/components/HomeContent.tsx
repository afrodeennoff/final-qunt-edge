import { Suspense } from 'react'
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
import { SocialProofLazy, FAQSectionLazy, TrustAndProofLazy, SectionSkeleton } from './LazySections'
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
      name: t('landing.home.testimonials.testimonial1Name'),
      quote: t('landing.home.testimonials.testimonial1Quote'),
    },
    {
      name: t('landing.home.testimonials.testimonial2Name'),
      quote: t('landing.home.testimonials.testimonial2Quote'),
    },
    {
      name: t('landing.home.testimonials.testimonial3Name'),
      quote: t('landing.home.testimonials.testimonial3Quote'),
    },
  ]

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background selection:bg-primary/30 selection:text-foreground">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero — above fold, no Suspense needed */}
        <MarketingSection className="relative pt-24 sm:pt-32 lg:pt-40 overflow-hidden">
          {/* Radial purple glow overlay */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--mkt-gradient-glow)' }} aria-hidden />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 60%)' }} aria-hidden />
          <div className="relative z-10 mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-6">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mkt-border-accent)] bg-[var(--mkt-accent-subtle)] px-3.5 py-1 text-[12px] font-medium tracking-[0.01em] text-[var(--mkt-accent)]">
                <span className="text-[10px]">&#10022;</span>
                {t('landing.hero.badge')}
              </span>
              <h1
                className={`${marketingHeroTitleClassName} leading-[1.02]`}
                style={{
                  background: 'var(--mkt-gradient-purple)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('landing.hero.headline')}
              </h1>
              <p className={`${marketingBodyClassName} mx-auto max-w-lg text-lg leading-relaxed`}>
                {t('landing.hero.subheadline')}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              {/* Primary CTA — Purple gradient */}
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-7 text-[14px] font-semibold text-white shadow-[var(--mkt-shadow-glow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:shadow-[var(--mkt-shadow-glow)] active:scale-[0.97]',
                )}
                style={{ background: 'var(--mkt-gradient-purple)' }}
              >
                <span>{t('landing.hero.ctaPrimary')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* Secondary CTA — Outline */}
              <a
                href="#product-walkthrough"
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--mkt-border-default)] bg-transparent px-7 text-[14px] font-medium text-[var(--mkt-text-primary)] transition-[border-color,background-color] duration-200 hover:bg-white/[0.04] hover:border-[var(--mkt-border-strong)]',
                )}
              >
                <Play className="h-4 w-4" />
                <span>{t('landing.hero.ctaSecondary')}</span>
              </a>
            </div>
          </div>
        </MarketingSection>

        {/* Social Proof — streaming boundary */}
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<SectionSkeleton />}>
            <SocialProofLazy />
          </Suspense>
        </ErrorBoundary>

        {/* Features — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
          <MarketingSection id="features" className="py-16 lg:py-20">
            <MarketingSectionHeader
              eyebrow={t('landing.home.features.eyebrow')}
              title={
                <>
                  {t('landing.home.features.title')}{' '}
                  <span className="text-[var(--mkt-accent)]">{t('landing.home.features.highlight')}</span>
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
        </Suspense>

        {/* Workflow — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
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
        </Suspense>

        {/* Demo — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
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
        </Suspense>

        {/* Testimonials — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
          <MarketingSection id="testimonials" className="py-16 lg:py-20">
            <MarketingSectionHeader
              eyebrow={t('landing.home.testimonials.eyebrow')}
              title={t('landing.home.testimonials.title')}
              description={t('landing.home.testimonials.description')}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="group rounded-2xl border border-[var(--mkt-border-subtle)] bg-[var(--mkt-bg-surface)]/80 p-6 text-left shadow-sm transition-[border-color,background-color,transform] duration-200 hover:border-[var(--mkt-border-accent)] hover:bg-[linear-gradient(135deg,var(--mkt-bg-surface)_0%,rgba(139,92,246,0.04)_100%)] hover:-translate-y-[2px]"
                >
                  <p className="text-[15px] leading-[1.65] text-[var(--mkt-text-primary)]/80 italic">{item.quote}</p>
                  <div className="mt-5 border-t border-[var(--mkt-border-subtle)] pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mkt-accent)]">
                      {item.name}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </MarketingSection>
        </Suspense>

        {/* Pricing — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
          <MarketingPricingSection locale={locale} />
        </Suspense>

        {/* Secondary Value — streaming boundary */}
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<SectionSkeleton />}>
            <TrustAndProofLazy />
          </Suspense>
        </ErrorBoundary>

        {/* FAQ — streaming boundary */}
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<SectionSkeleton />}>
            <FAQSectionLazy />
          </Suspense>
        </ErrorBoundary>

        {/* Final CTA — streaming boundary */}
        <Suspense fallback={<SectionSkeleton />}>
          <MarketingSection className="relative pb-24 pt-16 text-center lg:pb-28 overflow-hidden">
            {/* Subtle radial glow behind CTA */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 60%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} aria-hidden />
            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mkt-accent)]">
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
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-7 text-[14px] font-semibold text-white shadow-[var(--mkt-shadow-glow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:shadow-[var(--mkt-shadow-glow)] active:scale-[0.97] sm:w-auto',
                    )}
                    style={{ background: 'var(--mkt-gradient-purple)' }}
                  >
                    <span>{t('landing.home.finalCta.primary')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${locale}/propfirms`}
                    className={cn(
                      'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--mkt-border-default)] bg-transparent px-7 text-[14px] font-medium text-[var(--mkt-text-primary)] transition-[border-color,background-color] duration-200 hover:bg-white/[0.04] hover:border-[var(--mkt-border-strong)] sm:w-auto',
                    )}
                  >
                    {t('landing.home.finalCta.secondary')}
                  </Link>
                </div>
              </div>
            </div>
          </MarketingSection>
        </Suspense>
      </main>
    </div>
  )
}
