import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/trade-log', title: 'Trade Log | Qunt Edge Docs', description: 'Review, edit, and manage your trades in the Trade Log.' })
}

export default async function DocsTradeLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Log</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Trade Log (Trades page) displays all your trades in a sortable, filterable table. Each row shows the instrument, side, quantity, entry/exit prices, P&amp;L, commission, duration, and tags.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Editing Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Click any cell to edit it inline. You can modify the instrument, side, prices, quantity, add tags, comments, images, and video URLs. Changes save automatically.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Bulk Operations</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Select multiple trades to edit tags, add comments, or delete in bulk. Use Shift+click to select a range.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tabs</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Switch between All Trades, Wins, Losses, and Breakeven using the tab bar at the top of the table for quick filtering.</p>
    </>
  )
}
