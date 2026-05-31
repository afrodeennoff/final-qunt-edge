import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/accounts', title: 'Accounts | Qunt Edge Docs', description: 'Track account growth, prop firm compliance, and payouts.' })
}

export default async function DocsAccountsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Accounts</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">Manage your brokerage and prop firm accounts. Track balances, drawdown, profit targets, payout schedules, and compliance.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Types</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Evaluation Accounts:</strong> Prop firm challenges with profit targets and consistency rules</li>
        <li><strong className="text-foreground">Funded Accounts:</strong> Live capital with drawdown limits and payout schedules</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Key Metrics</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Each account card shows starting balance, current P&amp;L, drawdown remaining, buffer status, profit target progress, days traded, and consistency percentage.</p>
    </>
  )
}
