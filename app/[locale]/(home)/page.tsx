import { setStaticParamsLocale } from 'next-international/server'
import { Metadata } from 'next'
import { getI18n, getStaticParams } from '@/locales/server'
import dynamic from 'next/dynamic'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
} from '@/lib/seo'
import { Skeleton } from '@/components/ui/skeleton'

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

  const [softwareSchema, organizationSchema, breadcrumbSchema] = await Promise.all([
    buildSoftwareApplicationSchema(locale, '/'),
    buildOrganizationSchema(),
    buildBreadcrumbSchema(locale, [{ name: 'Home', path: '/' }]),
  ])

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
      <HomeContent />
    </>
  )
}

const HomeContent = dynamic(() => import('./components/HomeContent'), {
  loading: () => (
    <div className="qe-home-ref relative min-w-0 overflow-x-hidden bg-[var(--qe-ref-surface)] text-[var(--qe-ref-text)]">
      <main className="relative z-10 mx-auto w-full max-w-[1100px] min-w-0 px-6">
        {/* Hero skeleton */}
        <section className="pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <Skeleton className="h-6 w-56 rounded-full bg-white/8" />
              <Skeleton className="h-[92px] w-full max-w-[520px] rounded-2xl bg-white/8" />
              <Skeleton className="h-4 w-[340px] rounded bg-white/8" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-12 w-40 rounded-full bg-[var(--qe-ref-green)]/30" />
                <Skeleton className="h-12 w-32 rounded-full bg-white/8" />
              </div>
            </div>
            <div className="relative">
              <Skeleton className="h-[360px] w-full max-w-[460px] rounded-2xl bg-white/5 mx-auto" />
            </div>
          </div>
        </section>

        {/* Features skeleton */}
        <section className="pb-16 sm:pb-20">
          <div className="text-center mb-10 space-y-3">
            <Skeleton className="mx-auto h-4 w-48 rounded-full bg-white/8" />
            <Skeleton className="mx-auto h-[52px] w-[420px] rounded-2xl bg-white/8" />
            <Skeleton className="mx-auto h-4 w-[520px] rounded bg-white/8" />
          </div>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[280px] rounded-xl bg-white/5" />
            ))}
          </div>
        </section>

        {/* Advanced Trading skeleton */}
        <section className="pb-16 sm:pb-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <Skeleton className="h-4 w-40 rounded-full bg-white/8" />
              <Skeleton className="h-[48px] w-full max-w-[480px] rounded-2xl bg-white/8" />
              <Skeleton className="h-4 w-[320px] rounded bg-white/8" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/5" />
              ))}
              <Skeleton className="h-10 w-24 rounded-full bg-[var(--qe-ref-green)]/30 mt-4" />
            </div>
            <Skeleton className="h-[300px] w-full max-w-[400px] rounded-2xl bg-white/5 mx-auto" />
          </div>
        </section>
      </main>
    </div>
  ),
  ssr: true
})
