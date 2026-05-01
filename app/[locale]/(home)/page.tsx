import { setStaticParamsLocale } from 'next-international/server'
import { Metadata } from 'next'
import { getI18n, getStaticParams } from '@/locales/server'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'

type Locale = 'en' | 'fr'

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getI18n()

  return buildPublicMetadata({
    locale,
    path: '/',
    title: String(t('landing.home.metadata.title')),
    description: String(t('landing.home.metadata.description')),
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  const softwareSchema = buildSoftwareApplicationSchema(locale, '/')
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Home', path: '/' }])

  return (
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
      <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen">Loading content...</div>}>
        <HomeContent locale={locale} />
      </ErrorBoundary>
    </>
  )
}

const HomeContent = dynamic(() => import('./components/HomeContent'), {
  loading: () => (
    <div className="home-borderless relative min-w-0 overflow-x-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-48 rounded-b-[2.5rem] border border-border/40 bg-background/40 sm:inset-x-6 lg:inset-x-10 animate-pulse" />
      <div className="pointer-events-none absolute inset-0 hidden marketing-grid opacity-5 lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[22%] h-px bg-border/50" />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-6 w-32 animate-pulse bg-muted rounded mx-auto" />
            <div className="space-y-6">
              <div className="h-16 w-96 animate-pulse bg-muted rounded mx-auto" />
              <div className="h-6 w-64 animate-pulse bg-muted rounded mx-auto" />
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  ),
  ssr: false
})
