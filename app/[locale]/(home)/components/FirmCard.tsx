'use client'

import Link from 'next/link'
import { ArrowRight, Banknote, BriefcaseBusiness, Shield, Wallet } from 'lucide-react'
import type { UnifiedFirm } from '@/server/deals'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { safeArrayMin } from '@/lib/array-utils'
import { useI18n } from '@/locales/client'

interface FirmCardProps {
  firm: UnifiedFirm
  locale: string
}

function getLowestPriceLabel(
  firm: UnifiedFirm,
  noLivePricingLabel: string,
  formatPricingFrom: (price: string) => string,
): string {
  const prices = Object.values(firm.accountSizes)
    .map((account) => account.priceWithPromo || account.price)
    .filter((price) => Number.isFinite(price) && price > 0)

  if (prices.length === 0) return noLivePricingLabel
  return formatPricingFrom(`$${safeArrayMin(prices)}`)
}

export default function FirmCard({ firm, locale }: FirmCardProps) {
  const t = useI18n()

  return (
    <Link
      href={`/${locale}/firm/${firm.slug}`}
      className="group flex h-full flex-col rounded-lg border border-border/50 bg-card/80 p-5 shadow-sm transition-colors hover:border-border hover:bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-border/50 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {firm.platform}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{firm.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('landing.home.explorer.payoutSummary', {
              payoutModel: firm.payoutModel,
              drawdownType: firm.drawdownType.toLowerCase(),
            })}
          </p>
        </div>
        <div className="rounded-md border border-border/50 bg-background/70 px-3 py-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('landing.home.explorer.reviews')}
          </p>
          <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">
            {firm._count.reviews}
          </p>
        </div>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
        <Metric
          icon={Wallet}
          label={String(t('landing.home.explorer.accountValue'))}
          value={formatCompactCurrency(firm.catalogueStats.totalAccountValue)}
        />
        <Metric
          icon={Banknote}
          label={String(t('landing.home.explorer.paidOut'))}
          value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)}
        />
        <Metric
          icon={Shield}
          label={String(t('landing.home.explorer.profitSplit'))}
          value={firm.profitSplit}
        />
        <Metric
          icon={BriefcaseBusiness}
          label={String(t('landing.home.explorer.pricing'))}
          value={getLowestPriceLabel(
            firm,
            String(t('landing.home.explorer.noLivePricing')),
            (price) => String(t('landing.home.explorer.pricingFrom', { price })),
          )}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('landing.home.explorer.liveAccounts')}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {t('landing.home.explorer.trackedAccounts', {
              count: firm.catalogueStats.accountsCount.toLocaleString(),
            })}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          {t('landing.home.explorer.viewFirm')}
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
    <div className="rounded-md border border-border/50 bg-background/70 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 tabular-nums text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
