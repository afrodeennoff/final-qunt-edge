import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
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
      'Complete guide to the Qunt Edge trading journal, analytics, and workflow platform.',
  })
}

export default async function DocsOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to Qunt Edge</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Qunt Edge is a comprehensive trading journal and analytics platform. This documentation
        covers every feature—from importing your first trade to leveraging AI-powered behavioral
        analysis.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground pt-2">What You Can Do</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Import trades</strong> from Tradovate, Rithmic, NinjaTrader, IBKR, and 10+ other platforms</li>
        <li><strong className="text-foreground">Review and annotate</strong> every trade with pre-trade notes, post-trade reviews, emotions, and tags</li>
        <li><strong className="text-foreground">Analyze performance</strong> with widgets, charts, and the Copilot AI engine</li>
        <li><strong className="text-foreground">Track prop firm compliance</strong> against drawdown, profit targets, and consistency rules</li>
        <li><strong className="text-foreground">Share your profile</strong> and compare with the community leaderboard</li>
      </ul>

      <h2 className="text-lg font-semibold tracking-tight text-foreground pt-2">Getting Started</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Head over to the <a href={`/${locale}/docs/getting-started`} className="text-primary underline underline-offset-2 hover:no-underline">Quick Start guide</a> to set up your account, connect a broker, and see your first trade data in under 5 minutes.
      </p>
    </>
  )
}
