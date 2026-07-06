import type { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
} from '@/lib/seo'
import { getFaqItems } from '@/lib/faq-data'
import { FAQClientContent } from './faq-client-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/faq',
    title: 'Trading Journal FAQ | Qunt Edge',
    description:
      'Frequently asked questions about Qunt Edge trading journal workflows, broker support, behavior analytics, team features, pricing, and security.',
  })
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  const allFaqs = getFaqItems()

  // Server-rendered schemas using the full rich dataset (excellent SEO)
  const faqSchema = buildFaqPageSchema(
    allFaqs.map((f) => ({ question: f.question, answer: f.answer }))
  )
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <FAQClientContent locale={locale} allFaqs={allFaqs} />
    </>
  )
}
