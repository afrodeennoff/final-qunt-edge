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
      <HomeContent locale={locale} />
    </>
  )
}

const HomeContent = dynamic(() => import('./components/HomeContent'), {
  loading: () => (
      <div className="relative min-w-0 overflow-x-hidden bg-transparent">
      <main className="relative z-10 mx-auto w-full max-w-[1280px] min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <Skeleton className="h-5 w-32 rounded mx-auto" />
            <Skeleton className="h-14 sm:h-16 w-[min(100%,42rem)] rounded-2xl mx-auto" />
            <Skeleton className="h-4 w-80 rounded mx-auto mt-4" />
            <div className="flex justify-center gap-3 mt-8">
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
        </div>
        {/* Live stats skeleton */}
        <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  ),
  ssr: true
})
