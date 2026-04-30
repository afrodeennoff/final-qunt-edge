import { Metadata } from 'next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { setStaticParamsLocale } from 'next-international/server'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
} from '@/lib/seo'

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
      'Frequently asked questions about Qunt Edge trading-journal workflows, broker support, security, and team analytics.',
  })
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  const faqs = [
    {
      question: 'What makes Qunt Edge different from traditional journals?',
      answer:
        'Traditional journals focus on PnL, a lagging indicator. Qunt Edge audits execution decisions and the behavior between chart read and trade entry.',
    },
    {
      question: 'Which brokers and platforms do you support?',
      answer:
        'We support major institutional and retail platforms including Tradovate, Rithmic, Interactive Brokers, and CQG, with more connectors added by demand.',
    },
    {
      question: 'Is my trading data secure?',
      answer:
        'Your trading data is encrypted and stored with strong platform controls. We do not share individual trade data with third parties.',
    },
    {
      question: 'Does Qunt Edge provide trading signals?',
      answer:
        'No. Qunt Edge is an analytics and review platform, not a signal service or copy-trading product.',
    },
    {
      question: 'Can I use Qunt Edge for my trading team?',
      answer:
        'Yes. Teams can review trader performance, behavior, and risk with shared analytics and consistent workflows.',
    },
  ]
  const faqSchema = buildFaqPageSchema(faqs)
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingSection className="pt-24 lg:pt-32">
        <MarketingSectionHeader
          eyebrow="FAQ"
          title="Answers before setup."
          titleAs="h1"
          description="Common questions about Qunt Edge workflows, integrations, data security, and teams."
        />
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="mb-3 rounded-2xl border border-[oklch(0.65_0.22_260_/_0.09)] bg-[linear-gradient(180deg,oklch(0.062_0.012_260_/_0.82)_0%,oklch(0.054_0.01_260_/_0.76)_100%)] px-5 py-1 shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_16px_32px_-26px_rgba(0,0,0,0.62)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[oklch(0.65_0.22_260_/_0.13)]"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 text-[15px] leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MarketingSection>

      <MarketingSection className="pb-28 text-center">
        <MarketingSectionHeader
          eyebrow="Support"
          title="Still have questions?"
          description="Get help with setup, billing, integrations, and review workflows."
        />
        <Button asChild>
          <a href={`/${locale}/support`}>Contact support</a>
        </Button>
      </MarketingSection>
    </>
  )
}
