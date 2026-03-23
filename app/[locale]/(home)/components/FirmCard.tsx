'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, DollarSign, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PropFirm } from '@/app/[locale]/dashboard/components/accounts/config'

interface FirmCardProps {
  firm: PropFirm
  locale: string
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value}`
}

function getFirmMetrics(firm: PropFirm) {
  const sizes = Object.values(firm.accountSizes)
  if (sizes.length === 0) {
    return {
      maxAllocation: 0,
      profitSplit: 0,
      drawdownType: 'N/A',
      priceRange: 'N/A',
      accountCount: 0,
      hasEvaluation: false,
      minDays: 0,
    }
  }

  const maxAllocation = Math.max(...sizes.map((s) => s.balance))
  const profitSplit = sizes[0].profitSharing
  const drawdownType = sizes[0].trailing || 'N/A'
  const minPrice = Math.min(...sizes.map((s) => s.priceWithPromo || s.price))
  const maxPrice = Math.max(...sizes.map((s) => s.priceWithPromo || s.price))
  const hasEvaluation = sizes.some((s) => s.evaluation)
  const minDays = Math.min(
    ...sizes
      .map((s) => (typeof s.minDays === 'number' ? s.minDays : 0))
      .filter((d) => d > 0)
  )

  return {
    maxAllocation,
    profitSplit,
    drawdownType,
    priceRange: minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`,
    accountCount: sizes.length,
    hasEvaluation,
    minDays: minDays || 0,
  }
}

function getChallengeType(firm: PropFirm): string {
  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((s) => !s.evaluation)
  if (hasInstant) return 'Instant'

  const hasSinglePhase = sizes.some(
    (s) => s.evaluation && typeof s.minDays === 'number' && s.minDays <= 10
  )
  if (hasSinglePhase) return 'One-phase'

  return 'Two-phase'
}

export default function FirmCard({ firm, locale }: FirmCardProps) {
  const metrics = getFirmMetrics(firm)
  const challengeType = getChallengeType(firm)

  return (
    <Link href={`/${locale}/propfirms`} className="block group">
      <Card className="h-full border-border/60 bg-card/80 transition-all duration-200 group-hover:border-border group-hover:bg-card/90 group-hover:shadow-lg group-hover:shadow-black/5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {firm.name}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="border-border/60 bg-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {challengeType}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-border/60 bg-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                    metrics.drawdownType === 'EOD'
                      ? 'text-foreground/80'
                      : metrics.drawdownType === 'Static'
                        ? 'text-foreground/80'
                        : 'text-muted-foreground'
                  )}
                >
                  {metrics.drawdownType}
                </Badge>
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-foreground/5 text-xs font-semibold text-foreground/70">
              {firm.name.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground [font-family:var(--home-copy)]">
                <TrendingUp className="h-3 w-3" />
                Profit Split
              </div>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {metrics.profitSplit}%
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground [font-family:var(--home-copy)]">
                <DollarSign className="h-3 w-3" />
                Max Allocation
              </div>
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {formatCurrency(metrics.maxAllocation)}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground [font-family:var(--home-copy)]">
                <Shield className="h-3 w-3" />
                Drawdown
              </div>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {metrics.drawdownType}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground [font-family:var(--home-copy)]">
                <Layers className="h-3 w-3" />
                Plans
              </div>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground [font-family:var(--home-display)]">
                {metrics.accountCount} sizes
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-xs text-muted-foreground [font-family:var(--home-copy)]">
              From {metrics.priceRange}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground [font-family:var(--home-copy)]">
              View Details
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
