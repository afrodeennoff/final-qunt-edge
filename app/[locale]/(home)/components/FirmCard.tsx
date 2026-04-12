'use client'

import Link from 'next/link'
import { ArrowRight, Banknote, BriefcaseBusiness, Shield, Wallet } from 'lucide-react'
import type { UnifiedFirm } from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { safeArrayMin } from '@/lib/array-utils'

interface FirmCardProps {
  firm: UnifiedFirm
  locale: string
}

function getLowestPriceLabel(firm: UnifiedFirm): string {
  const prices = Object.values(firm.accountSizes)
    .map((account) => account.priceWithPromo || account.price)
    .filter((price) => Number.isFinite(price) && price > 0)

  if (prices.length === 0) return 'No live pricing'
  return `From $${safeArrayMin(prices)}`
}

export default function FirmCard({ firm, locale }: FirmCardProps) {
  return (
    <Link
      href={`/${locale}/firm/${firm.slug}`}
      className="group block rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--frost-border-strong)] hover:bg-[var(--surface-card)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {firm.platform}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground/95">{firm.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {firm.payoutModel} payouts • {firm.drawdownType.toLowerCase()} rules
          </p>
        </div>
        <div className="rounded-xl border border-[var(--frost-border)] bg-[oklch(0.06_0_0)] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Reviews</p>
          <p className="mt-1 text-lg font-semibold text-foreground/95">{firm._count.reviews}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={Wallet} label="Account value" value={formatCompactCurrency(firm.catalogueStats.totalAccountValue)} />
        <Metric icon={Banknote} label="Paid out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} />
        <Metric icon={Shield} label="Profit split" value={firm.profitSplit} />
        <Metric icon={BriefcaseBusiness} label="Pricing" value={getLowestPriceLabel(firm)} />
      </div>

        <div className="mt-5 flex items-center justify-between border-t border-[var(--frost-border)] pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live accounts</p>
          <p className="mt-1 text-sm font-medium text-foreground/95">
            {firm.catalogueStats.accountsCount.toLocaleString()} tracked accounts
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/95">
          View firm
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--frost-border)] bg-[var(--surface-card)] p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground/95">{value}</p>
    </div>
  )
}
