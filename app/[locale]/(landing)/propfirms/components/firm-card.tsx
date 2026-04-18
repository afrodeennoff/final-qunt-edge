"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { PropfirmCatalogueStats } from "../actions/types"

interface FirmCardProps {
  locale: string
  name: string
  slug: string
  stats: PropfirmCatalogueStats
  accountSizesCount: number
}

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  notation: "compact",
})

const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function FirmCard({ locale, name, slug, stats, accountSizesCount }: FirmCardProps) {
  const { payouts, accountsCount, totalAccountValue, sizeBreakdown } = stats
  const paidAmount = payouts.paidAmount
  const paidCount = payouts.paidCount
  const pendingAmount = payouts.pendingAmount
  const refusedAmount = payouts.refusedAmount

  const totalPayouts = paidAmount + pendingAmount + refusedAmount
  const paidPercentage = totalPayouts > 0 ? (paidAmount / totalPayouts) * 100 : 0

  return (
    <Link href={`/${locale}/firm/${slug}`} className="block group">
      <article className="relative overflow-hidden rounded-xl border border-border/30 bg-background/0.14 transition-all duration-300 hover:-translate-y-1 hover:border-border/40 hover:bg-primary/[0.03]">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Header */}
        <div className="border-b border-border/20 p-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-tight text-foreground">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="rounded-full border-border/20 bg-muted/30 text-[10px] font-medium tracking-wide text-muted-foreground">
                  {accountSizesCount} {accountSizesCount === 1 ? "Size" : "Sizes"}
                </Badge>
                <span className="text-[10px] text-muted-foreground/60">•</span>
                <span className="text-[10px] text-muted-foreground/80 font-medium">
                  {sizeBreakdown}
                </span>
              </div>
            </div>

            {/* Registered count badge */}
            <div className="flex-shrink-0 text-right">
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                Registered
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                {accountsCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-3 divide-x divide-border/40 border-b border-border/20">
          <div className="px-4 py-3 text-center">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
              Account Value
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {compactCurrency.format(totalAccountValue)}
            </div>
          </div>
          <div className="px-4 py-3 text-center">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
              Paid Out
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {compactCurrency.format(paidAmount)}
            </div>
          </div>
          <div className="px-4 py-3 text-center">
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
              Payouts
            </div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {paidCount}
            </div>
          </div>
        </div>

        {/* Payout Breakdown */}
        <div className="space-y-3 p-4">
          {/* Paid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/80" />
              <span className="text-xs text-muted-foreground">Paid</span>
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {fullCurrency.format(paidAmount)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-primary/60 transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>

          {/* Pending & Refused */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-background/25-foreground/40" />
                <span className="text-[11px] text-muted-foreground/70">
                  Pending: {fullCurrency.format(pendingAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-destructive/50" />
                <span className="text-[11px] text-muted-foreground/70">
                  Refused: {fullCurrency.format(refusedAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-4">
          <span className="inline-flex h-9 w-full items-center justify-center rounded-full border border-border/20 text-xs font-medium text-muted-foreground transition-all duration-200 group-hover:border-border/30 group-hover:bg-muted/50 group-hover:text-foreground">
            View Details
            <svg className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  )
}
