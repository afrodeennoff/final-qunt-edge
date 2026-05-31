import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/getting-started', title: 'Quick Start Guide | Qunt Edge Docs', description: 'Set up your Qunt Edge account and import your first trades in minutes.' })
}

export default async function GettingStartedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quick Start Guide</h1>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">1. Create Your Account</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Visit the <a href={`/${locale}/authentication`} className="text-primary underline underline-offset-2">sign-in page</a> and enter your email. If you don&apos;t have an account yet, one will be created automatically.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">2. Import Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Navigate to the Import page from the dashboard sidebar. You can:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Auto-sync</strong> with Tradovate, Rithmic, or DXfeed by entering your credentials</li>
        <li><strong className="text-foreground">Upload files</strong> from NinjaTrader, MT5, IBKR (PDF), or CSV/Excel exports</li>
        <li><strong className="text-foreground">Enter manually</strong> with the manual trade entry form</li>
      </ul>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">3. Review Your Dashboard</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Once trades are imported, the Dashboard overview shows your P&amp;L, winrate, equity curve, and other key metrics. Customize the layout by adding, removing, and rearranging widgets.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">4. Journal Your Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Open the Trade Journal page to add pre-trade notes, post-trade reviews, emotions, confidence ratings, and custom tags for every trade. This data powers the AI Copilot and behavioral analysis.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">5. Explore Analytics</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The Copilot page provides AI-generated insights about your trading patterns, risk management, and areas for improvement. The Statistics page breaks down performance by ticker, day, and setup tag.
      </p>
    </>
  )
}
