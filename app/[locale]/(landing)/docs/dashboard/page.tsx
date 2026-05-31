import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/dashboard', title: 'Dashboard | Qunt Edge Docs', description: 'Understanding the Qunt Edge dashboard overview, widgets, and layout.' })
}

export default async function DocsDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Dashboard is your command center. It displays widget cards showing P&amp;L, winrate, equity curve, risk-reward ratio, profit factor, and more.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Widgets</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Statistics Widget:</strong> Net P&amp;L, winrate, total trades, long/short distribution</li>
        <li><strong className="text-foreground">Equity Chart:</strong> Cumulative P&amp;L over time with interactive tooltips</li>
        <li><strong className="text-foreground">Risk Metrics:</strong> Profit factor, expectancy, Sharpe-like ratio</li>
        <li><strong className="text-foreground">Calendar:</strong> Daily P&amp;L heatmap with mood tracking</li>
        <li><strong className="text-foreground">Mindset:</strong> Emotion trend, hourly timeline, news impact</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Customization</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Click the grid icon in the header to enter widget edit mode. Drag to reorder, resize, add, or remove widgets. Your layout auto-saves.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Filters</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Use the filter bar to scope data by date range, account, instrument, P&amp;L range, tags, or weekday. Filters apply across all widgets and the trade table.</p>
    </>
  )
}
