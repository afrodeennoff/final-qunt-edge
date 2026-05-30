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
    <div className="qe-home-ref relative min-w-0 overflow-x-hidden bg-[#0a0c0a] text-[#f1f5f2]">
      <main className="relative z-10 mx-auto w-full max-w-[1100px] min-w-0 px-6">
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <Skeleton className="h-6 w-64 rounded-full bg-white/10" />
              <Skeleton className="h-[92px] w-full max-w-[520px] rounded-2xl bg-white/10" />
              <Skeleton className="h-4 w-[320px] rounded bg-white/10" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-12 w-40 rounded-full bg-[#22c55e]" />
                <Skeleton className="h-12 w-32 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="relative">
              <Skeleton className="h-[320px] w-full max-w-[420px] rounded-2xl bg-white/5 mx-auto" />
            </div>
          </div>
        </div>
      </main>
    </div>
  ),
  ssr: true
})
