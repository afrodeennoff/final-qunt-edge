import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import DocsContent from './docs-content'

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
      'Complete professional manual for Qunt Edge — the AI-powered trading journal for serious traders. Dashboard widgets, Copilot, journal workflows, prop firm tools, import, teams, and analytics.',
  })
}

export default async function DocsOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return <DocsContent />
}
