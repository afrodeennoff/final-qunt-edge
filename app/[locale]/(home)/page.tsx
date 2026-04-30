import { setStaticParamsLocale } from 'next-international/server'
import { Metadata } from 'next'
import { getStaticParams } from '@/locales/server'
import HomeContent from './components/HomeContent'
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
    locale = await params
    setStaticParamsLocale(locale)
  } catch {
    locale = 'en'
  }

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
      <HomeContent locale={locale} />
    </>
  )
}
