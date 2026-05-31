import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/journal', title: 'Trade Journal | Qunt Edge Docs', description: 'Journal your trades with notes, emotions, and tags.' })
}

export default async function DocsJournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Journal</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Trade Journal (Notes page) provides a side-by-side view with your trade on the left and a journal editor on the right.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Journal Fields</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Pre-Trade Notes:</strong> Your analysis, plan, and rationale before entering the trade</li>
        <li><strong className="text-foreground">Post-Trade Review:</strong> What happened, what went well, what to improve</li>
        <li><strong className="text-foreground">Emotions:</strong> How you felt during the trade</li>
        <li><strong className="text-foreground">Confidence Rating:</strong> 1-10 scale</li>
        <li><strong className="text-foreground">Discipline Score:</strong> 1-10 rating of plan adherence</li>
        <li><strong className="text-foreground">Custom Tags:</strong> Categorize setups (e.g., breakout, reversal, scalp)</li>
        <li><strong className="text-foreground">Screenshots:</strong> Attach chart images</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tag Tabs</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Organize tags into tab groups. For example, create a &quot;Setups&quot; tab with breakout/reversal/momentum and a &quot;Mistakes&quot; tab with revenge-trading/fomo/overtrading.</p>
    </>
  )
}
