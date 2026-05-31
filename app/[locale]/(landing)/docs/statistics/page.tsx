import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/statistics', title: 'Statistics | Qunt Edge Docs', description: 'Performance breakdown by ticker, day, and setup tag.' })
}

export default async function DocsStatisticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Statistics</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Statistics page breaks down your performance across three dimensions: ticker, day, and setup tag.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Ticker Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Shows every instrument with total trades, winrate, average risk-reward ratio, and total risk-reward ratio. Sort by any column to compare.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Daily Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Groups trades by trading day. Each row shows the day&apos;s total trades, winrate, avg RR, and total RR.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Setup Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Aggregates by custom tags from the Trade Journal. Only trades with journal entries and custom tags are included. See which setups deliver the best results.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Metrics</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Winrate:</strong> Wins / (Wins + Losses) &times; 100</li>
        <li><strong className="text-foreground">Avg RR:</strong> Average winning P&amp;L / Average losing P&amp;L (absolute)</li>
        <li><strong className="text-foreground">Total RR:</strong> Total winning P&amp;L / Total losing P&amp;L (absolute)</li>
      </ul>
    </>
  )
}
