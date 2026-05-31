import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/import', title: 'Data Import | Qunt Edge Docs', description: 'Import trades from Tradovate, Rithmic, NinjaTrader, and more.' })
}

export default async function DocsImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Data Import</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">Qunt Edge supports trade import from 10+ platforms. Navigate to the Import page in the dashboard sidebar.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Supported Platforms</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Auto-Sync:</strong> Tradovate, Rithmic, DXfeed</li>
        <li><strong className="text-foreground">File Upload:</strong> NinjaTrader, MT5, TradeZella, Topstep, FTMO, ETP, Thor, Quantower</li>
        <li><strong className="text-foreground">PDF:</strong> IBKR (Interactive Brokers) activity statements</li>
        <li><strong className="text-foreground">CSV/Excel:</strong> Generic column-mapping import for any format</li>
        <li><strong className="text-foreground">Manual Entry:</strong> Enter trades one-by-one</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tips</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li>CSV imports let you map columns manually—the system remembers your mappings</li>
        <li>Duplicate trades are detected automatically</li>
      </ul>
    </>
  )
}
