import { Suspense } from 'react'
import { setStaticParamsLocale } from 'next-international/server'
import { Metadata } from 'next'
import { getStaticParams } from '@/locales/server'
import HomeContent from './components/HomeContent'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'

type Locale = 'en' | 'fr'

const HOME_METADATA: Record<
  Locale,
  {
    title: string
    description: string
  }
> = {
  en: {
    title: 'Qunt Edge | Professional Trading Journal & Analytics Platform',
    description:
      'The professional trading journal for serious traders. Track every trade, review your behavior, and understand your execution cadence.',
  },
  fr: {
    title: 'Qunt Edge | Journal de trading professionnel et plateforme d analyse',
    description:
      'Le journal de trading professionnel pour les traders serieux. Suivez chaque trade, analysez votre comportement et comprenez votre cadence d execution.',
  },
}

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const metadata = HOME_METADATA[locale] ?? HOME_METADATA.en

  return buildPublicMetadata({
    locale,
    path: '/',
    title: metadata.title,
    description: metadata.description,
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  let locale: Locale = 'en'

  try {
    const resolvedParams = await params
    locale = resolvedParams.locale
    setStaticParamsLocale(locale)
  } catch {
    locale = 'en'
  }

  const softwareSchema = buildSoftwareApplicationSchema(locale, '/')
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Home', path: '/' }])

  return (
    <ErrorBoundary>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent locale={locale} />
        </Suspense>
      </>
    </ErrorBoundary>
  )
}

function HomeSkeleton() {
  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background">
      <main className="relative z-10 flex min-w-0 flex-col">
        <section className="flex flex-col items-center px-4 pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="mx-auto h-12 w-full max-w-2xl animate-pulse rounded bg-muted" />
              <div className="mx-auto h-6 w-full max-w-lg animate-pulse rounded bg-muted" />
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="h-11 w-44 animate-pulse rounded-lg bg-muted" />
              <div className="h-11 w-44 animate-pulse rounded-lg border border-border/20 bg-muted/50" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}