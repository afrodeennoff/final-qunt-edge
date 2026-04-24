import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import Link from 'next/link'
import { BookOpen, Brain, Cable, Code2 } from 'lucide-react'
import {
  MarketingFeatureCard,
  MarketingSection,
  MarketingSectionHeader,
} from '@/components/layout/marketing-sections'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/docs',
    title: 'Documentation | Qunt Edge',
    description:
      'Guides and references for Qunt Edge trading journal, analytics workflows, and integrations.',
  })
}

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const cards = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Getting Started',
      description: 'Set up your dashboard and first review workflow.',
    },
    {
      icon: <Cable className="h-5 w-5" />,
      title: 'Data Connectors',
      description: 'Connect Tradovate, Rithmic, IBKR, and more.',
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'AI Journaling',
      description: 'Use debriefs to turn patterns into next actions.',
    },
    {
      icon: <Code2 className="h-5 w-5" />,
      title: 'API Reference',
      description: 'Plan custom workflows and institutional integrations.',
    },
  ]

  return (
    <>
      <MarketingSection className="pt-24 lg:pt-32">
        <MarketingSectionHeader
          eyebrow="Documentation"
          title="Guides for cleaner workflows."
          titleAs="h1"
          description="Everything you need to set up Qunt Edge, connect data, and review trading behavior."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <MarketingFeatureCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              footer={<span>Coming soon</span>}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="pb-28 text-center">
        <p className="text-sm text-muted-foreground">
          Need immediate help? Visit{' '}
          <Link href={`/${locale}/support`} className="text-foreground hover:underline">
            Support
          </Link>{' '}
          or join{' '}
          <a href="https://discord.gg/efHDc43M" className="text-foreground hover:underline">
            Discord
          </a>
          .
        </p>
      </MarketingSection>
    </>
  )
}
