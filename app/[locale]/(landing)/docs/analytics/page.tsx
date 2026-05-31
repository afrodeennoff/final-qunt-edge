import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/analytics', title: 'Analytics & Copilot | Qunt Edge Docs', description: 'AI-powered analytics, patterns, and insights.' })
}

export default async function DocsAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics &amp; Copilot</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Analytics (Copilot) page provides AI-generated insights into your trading behavior, pattern recognition, and personalized recommendations.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Features</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">AI Debriefs:</strong> Automated post-session analysis of your trades</li>
        <li><strong className="text-foreground">Pattern Detection:</strong> Identifies recurring mistakes and strengths</li>
        <li><strong className="text-foreground">Behavioral Scores:</strong> Discipline, consistency, and emotional regulation metrics</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Charts</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Interactive charts for equity curve, P&amp;L by side, P&amp;L per contract, time-in-position distribution, weekday performance, tick distribution, and more.</p>
    </>
  )
}
