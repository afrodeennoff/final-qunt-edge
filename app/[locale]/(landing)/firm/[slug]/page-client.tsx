"use client"

import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import {
  Building2,
  Check,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Landmark,
  Layers,
  Shield,
  Target,
  TrendingUp,
  Wallet,
  FileText,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCompactCurrency } from '@/lib/formatting/currency'

const FirmReviewsSection = dynamic(
  () => import('./components/firm-reviews-section').then((m) => ({ default: m.FirmReviewsSection })),
  {
    loading: () => <Card className="p-6"><Skeleton className="h-48" /></Card>,
    ssr: false,
  }
)

const FirmCouponsSection = dynamic(
  () => import('./components/firm-coupons-section').then((m) => ({ default: m.FirmCouponsSection })),
  {
    loading: () => <Card className="p-6"><Skeleton className="h-32" /></Card>,
    ssr: false,
  }
)

type FirmData = {
  id: string
  slug: string
  name: string
  category: string
  description?: string | null
  shortDesc?: string | null
  platform?: string | null
  payoutModel?: string | null
  drawdownType?: string | null
  profitSplit?: string | null
  maxAllocation?: string | null
  referralUrl?: string | null
  logoUrl?: string | null
  _count?: { reviews?: number; coupons?: number }
  liveReviewStats?: {
    averageRating: number | null
    approvedCount: number
  }
  spotlight?: {
    slug: string
    name: string
    category: 'Futures' | 'CFD'
    rating: number
    reviewCount: number
    promoText: string
    promoCode?: string
    maxAllocation?: string
    countryCode?: string
    founded?: string
    yearsInOperation?: number
    sourceUrl: string
  } | null
  catalogueStats?: {
    accountsCount: number
    totalAccountValue: number
    paidPayoutAmount: number
    paidPayoutCount: number
    pendingPayoutAmount: number
    sizeBreakdown: string
  }
  accountSizes?: Record<string, {
    name: string
    balance: number
    price: number
    priceWithPromo: number
    target: number
    dailyLoss: number | null
    drawdown: number
    trailing?: string
    profitSharing: number
    evaluation: boolean
  }>
  coupons?: Array<{
    id: string
  }>
}

const trustChecklist = [
  'Approved trader reviews stay separate from the firm facts.',
  'Payout totals and counts come from tracked account records in the database.',
  'Profile, rules, and ROI tabs stay tied to the same firm record.',
]

type FirmSourceNotes = {
  overview: string[]
  rules: string[]
}

type FirmSourceMeta = {
  founded?: string
  countryCode?: string
  yearsInOperation?: number
}

function getFirmSourceMeta(): FirmSourceMeta {
  return {}
}

function getFirmSourceNotes(): FirmSourceNotes {
  return { overview: [], rules: [] }
}

const radarChartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

type AccountSizeEntry = [string, NonNullable<FirmData['accountSizes']>[string]]
type FactIcon = React.ComponentType<{ className?: string }>

function formatFirmCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getAccountSizeEntries(accountSizes?: FirmData['accountSizes']): AccountSizeEntry[] {
  return accountSizes ? Object.entries(accountSizes) : []
}

function withDetailFallback(value?: string | null): string {
  return value ?? 'Not listed'
}

function getVisibleReviewCount(firm: FirmData): number {
  return firm.liveReviewStats?.approvedCount ?? 0
}

function getVisibleCouponCount(firm: FirmData): number {
  return firm.coupons?.length ?? 0
}

function buildAdditionalDetails(firm: FirmData): Array<{ icon: FactIcon; label: string; value: string }> {
  const sourceMeta = getFirmSourceMeta()

  return [
    { icon: Building2, label: 'Category', value: withDetailFallback(firm.category) },
    { icon: Landmark, label: 'Founded', value: withDetailFallback(firm.spotlight?.founded ?? sourceMeta.founded) },
    { icon: Shield, label: 'Drawdown Type', value: withDetailFallback(firm.drawdownType) },
    { icon: Wallet, label: 'Max Allocation', value: withDetailFallback(firm.maxAllocation) },
    { icon: DollarSign, label: 'Profit Split', value: withDetailFallback(firm.profitSplit) },
    { icon: Clock, label: 'Payout Frequency', value: withDetailFallback(firm.payoutModel) },
    { icon: Layers, label: 'Platform', value: withDetailFallback(firm.platform) },
    { icon: Award, label: 'Country', value: withDetailFallback(firm.spotlight?.countryCode ?? sourceMeta.countryCode) },
  ]
}

function buildOverviewFacts(firm: FirmData): Array<{ icon: FactIcon; label: string; value: string }> {
  return [
    { icon: Layers, label: 'Platform', value: firm.platform ?? 'Not listed' },
    { icon: Wallet, label: 'Payout model', value: firm.payoutModel ?? 'Not listed' },
    { icon: Shield, label: 'Drawdown type', value: firm.drawdownType ?? 'Not listed' },
    { icon: DollarSign, label: 'Profit split', value: firm.profitSplit ?? 'Not listed' },
    { icon: Landmark, label: 'Max allocation', value: firm.maxAllocation ?? 'Not listed' },
    { icon: Building2, label: 'Category', value: firm.category ?? 'Not listed' },
  ]
}

function buildTrustMetrics(firm: FirmData): Array<{ label: string; value: string; highlight?: boolean }> {
  const metrics: Array<{ label: string; value: string; highlight?: boolean }> = []
  const reviewCount = getVisibleReviewCount(firm)

  if (firm.catalogueStats) {
    metrics.push(
      { label: 'Accounts', value: firm.catalogueStats.accountsCount.toLocaleString() },
      { label: 'Total Value', value: formatCompactCurrency(firm.catalogueStats.totalAccountValue), highlight: true },
      { label: 'Paid Out', value: formatCompactCurrency(firm.catalogueStats.paidPayoutAmount), highlight: true },
      { label: 'Payout Count', value: firm.catalogueStats.paidPayoutCount.toLocaleString() },
    )
  }

  metrics.push(
    { label: 'User reviews', value: reviewCount.toLocaleString() },
    { label: 'Coupons', value: getVisibleCouponCount(firm).toLocaleString() },
  )

  return metrics
}

function getResearchRatingValue(firm: FirmData): string {
  return firm.spotlight?.rating ? `${firm.spotlight.rating.toFixed(1)}/5` : 'Not rated'
}

function getResearchRatingHelper(firm: FirmData): string {
  const reviewCount = getVisibleReviewCount(firm)
  return reviewCount > 0
    ? `${reviewCount.toLocaleString()} visible user review${reviewCount === 1 ? '' : 's'}`
    : 'No visible user reviews in the current snapshot'
}

function getResearchPayoutValue(firm: FirmData): string {
  return (firm.catalogueStats?.paidPayoutCount ?? 0).toLocaleString()
}

function getResearchPayoutHelper(firm: FirmData): string {
  return firm.catalogueStats
    ? `${formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} paid out`
    : 'No payout data in the current snapshot'
}

function getResearchAccountValue(firm: FirmData): string {
  return (firm.catalogueStats?.accountsCount ?? 0).toLocaleString()
}

function getResearchAccountHelper(firm: FirmData): string {
  return firm.catalogueStats?.sizeBreakdown ?? 'No live account mix in the current snapshot'
}

function getResearchFitValue(firm: FirmData): string {
  return firm.platform ?? 'Not listed'
}

function getResearchFitHelper(firm: FirmData): string {
  return `${withDetailFallback(firm.drawdownType)} • ${withDetailFallback(firm.payoutModel)}`
}

function buildResearchSnapshot(firm: FirmData): Array<{ label: string; value: string; helper: string }> {
  return [
    {
      label: 'User review score',
      value: getResearchRatingValue(firm),
      helper: getResearchRatingHelper(firm),
    },
    {
      label: 'Database payouts',
      value: getResearchPayoutValue(firm),
      helper: getResearchPayoutHelper(firm),
    },
    {
      label: 'Tracked accounts',
      value: getResearchAccountValue(firm),
      helper: getResearchAccountHelper(firm),
    },
    {
      label: 'Trading fit',
      value: getResearchFitValue(firm),
      helper: getResearchFitHelper(firm),
    },
  ]
}

function getRuleFlexibility(drawdownType: string): number {
  if (drawdownType === 'Static') return 80
  if (drawdownType === 'Trailing') return 70
  return 75
}

function getRadarAccountsFunded(firm: FirmData): number {
  return Math.min(100, Math.round(firm.catalogueStats?.accountsCount ?? 0))
}

function getRadarPayoutsMade(firm: FirmData): number {
  const paidPayoutCount = firm.catalogueStats?.paidPayoutCount ?? 0
  return Math.min(100, Math.round((paidPayoutCount / 50) * 100))
}

function getRadarRatingScore(firm: FirmData): number {
  const rating = firm.liveReviewStats?.averageRating ?? 0
  return Math.round((rating / 5) * 100)
}

function parseProfitSplitAsPercent(profitSplit?: string | null): number {
  if (!profitSplit) return 70
  const match = profitSplit.match(/(\d{1,3})/)
  if (!match) return 70
  const parsed = Number.parseInt(match[1], 10)
  if (!Number.isFinite(parsed)) return 70
  return Math.max(0, Math.min(100, parsed))
}

function getPayoutModelScore(payoutModel?: string | null): number {
  if (!payoutModel) return 70
  const normalized = payoutModel.toLowerCase()
  if (normalized.includes('on-demand') || normalized.includes('ondemand')) return 95
  if (normalized.includes('weekly')) return 85
  if (normalized.includes('bi-week')) return 75
  if (normalized.includes('monthly')) return 60
  return 70
}

function getRadarRulesScore(firm: FirmData): number {
  const drawdownScore = getRuleFlexibility(firm.drawdownType ?? 'Static')
  const payoutScore = getPayoutModelScore(firm.payoutModel)
  const splitScore = parseProfitSplitAsPercent(firm.profitSplit)
  return Math.round((drawdownScore * 0.4) + (payoutScore * 0.35) + (splitScore * 0.25))
}

function getRadarValueForMoney(firm: FirmData): number {
  const paidPayoutAmount = firm.catalogueStats?.paidPayoutAmount ?? 0
  const paidPayoutCount = firm.catalogueStats?.paidPayoutCount || 1
  const avgPayoutPerAccount = paidPayoutAmount / paidPayoutCount
  return Math.min(100, Math.round((avgPayoutPerAccount / 10000) * 100))
}

function buildRadarMetrics(firm: FirmData): Array<{ label: string; value: number; max: number }> {
  return [
    { label: 'Total Accounts Funded', value: getRadarAccountsFunded(firm), max: 100 },
    { label: 'Total Payouts Made', value: getRadarPayoutsMade(firm), max: 100 },
    { label: 'Rating', value: getRadarRatingScore(firm), max: 100 },
    { label: 'Rules', value: getRadarRulesScore(firm), max: 100 },
    { label: 'Value for Money', value: getRadarValueForMoney(firm), max: 100 },
  ]
}

function getDrawdownDescription(drawdownType?: string | null): string {
  if (drawdownType === 'Trailing') {
    return 'Drawdown trails your highest profit point. More restrictive but allows for higher allocations.'
  }
  if (drawdownType === 'Static') {
    return 'Fixed drawdown limit from starting balance. More forgiving for swing traders.'
  }
  return 'Calculated at end of trading day. Allows intraday flexibility.'
}

function buildRules(firm: FirmData): Array<{ title: string; value: string; description: string }> {
  return [
    {
      title: 'Drawdown Type',
      value: firm.drawdownType ?? 'Not listed',
      description: getDrawdownDescription(firm.drawdownType),
    },
    {
      title: 'Payout Model',
      value: firm.payoutModel ?? 'Not listed',
      description: 'Current payout cadence published for this firm record and checked against the current help center where available.',
    },
    {
      title: 'Profit Split',
      value: firm.profitSplit ?? 'Not listed',
      description: 'Share of funded profits kept by the trader.',
    },
    {
      title: 'Max Allocation',
      value: firm.maxAllocation ?? 'Not listed',
      description: 'Maximum total capital visible in the current profile.',
    },
  ]
}

function getHeaderReviewLabel(firm: FirmData): string {
  const reviewCount = getVisibleReviewCount(firm)
  return `(${reviewCount.toLocaleString()} user review${reviewCount === 1 ? '' : 's'})`
}

function getHeaderOptionalItems(firm: FirmData): string[] {
  const sourceMeta = getFirmSourceMeta()
  const yearsInOperation = firm.spotlight?.yearsInOperation ?? sourceMeta.yearsInOperation
  const countryCode = firm.spotlight?.countryCode ?? sourceMeta.countryCode
  const founded = firm.spotlight?.founded ?? sourceMeta.founded

  return [
    yearsInOperation ? `${yearsInOperation} years in operation` : null,
    countryCode ?? null,
    founded ? `Founded ${founded}` : null,
  ].filter((item): item is string => Boolean(item))
}

function buildHeaderMetaItems(firm: FirmData): string[] {
  return [getHeaderReviewLabel(firm), ...getHeaderOptionalItems(firm)]
}

function buildHeaderMetrics(firm: FirmData): Array<{ label: string; value: string }> {
  return [
    { label: 'Profit Split', value: firm.profitSplit ?? 'Not listed' },
    { label: 'Max Allocation', value: firm.spotlight?.maxAllocation ?? firm.maxAllocation ?? 'Not listed' },
    { label: 'Drawdown Type', value: firm.drawdownType ?? 'Not listed' },
    { label: 'Active Coupons', value: getVisibleCouponCount(firm).toLocaleString() },
  ]
}

function firmInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

function formatCategoryTone(category: string): 'default' | 'accent' {
  return category === 'Futures' ? 'default' : 'accent'
}

function FactTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-[linear-gradient(150deg,hsl(var(--background)/0.82),hsl(var(--card)/0.38))] px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-white/[0.035]">
          <Icon className="h-4 w-4 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-sm font-semibold text-foreground/95">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/20 px-4 py-4',
        highlight
          ? 'bg-[linear-gradient(145deg,rgba(20,184,166,0.16),rgba(20,184,166,0.05))]'
          : 'bg-[linear-gradient(150deg,hsl(var(--background)/0.82),hsl(var(--card)/0.38))]'
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.03em] ${highlight ? 'text-v2-success' : 'text-foreground/95'}`}>{value}</p>
    </div>
  )
}

function ReferralCTA({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = referralUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Referral link</p>
          <CardTitle className="mt-3 text-2xl text-foreground/95">Open the official company site.</CardTitle>
          <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
            Use the firm link below if you want to continue from research into signup.
          </CardDescription>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/40 bg-background/50 px-3 py-3">
            <code className="min-w-0 flex-1 truncate text-xs text-foreground/80">{referralUrl}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-xl border border-border/40 bg-white/[0.05] p-2 transition-colors hover:bg-white/[0.010]"
              title="Copy link"
              type="button"
            >
              {copied ? <Check className="h-4 w-4 text-v2-accent" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <a
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-v2-accent px-6 py-3 text-sm font-semibold text-v2-accent-foreground transition-colors hover:bg-v2-accent-hover"
        >
          Visit Firm
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  )
}

function ChallengeCard({
  size,
  profitSplit,
}: {
  size: AccountSizeEntry[1]
  profitSplit: string
}) {
  const targetPercent = getTargetPercent(size)
  const dailyLossPercent = getDailyLossPercent(size)
  const drawdownPercent = getDrawdownPercent(size)
  const dailyLossValue = getDailyLossValue(size)

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={size.evaluation ? 'accent' : 'default'}>{size.name}</Badge>
              {!size.evaluation ? <Badge variant="default">Direct Funded</Badge> : null}
              {size.trailing ? <Badge variant="default">{size.trailing}</Badge> : null}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ChallengeStat label="Account Size" value={formatFirmCurrency(size.balance)} />
              <ChallengeStat label="Profit Target" value={formatFirmCurrency(size.target)} note={targetPercent} />
              <ChallengeStat label="Max Daily Loss" value={dailyLossValue} note={dailyLossPercent} />
              <ChallengeStat label="Max Drawdown" value={formatFirmCurrency(size.drawdown)} note={drawdownPercent} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ChallengeStat label="Profit Split" value={`${size.profitSharing}%`} />
              <ChallengeStat label="Evaluation" value={size.evaluation ? 'Required' : 'None'} />
              <ChallengePrice size={size} />
              <ChallengeStat label="Profit Split (Firm)" value={profitSplit ?? 'N/A'} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTargetPercent(size: AccountSizeEntry[1]): string | null {
  return size.target > 0 ? `${((size.target / size.balance) * 100).toFixed(1)}%` : null
}

function getDailyLossPercent(size: AccountSizeEntry[1]): string | null {
  if (size.dailyLoss === null || size.dailyLoss <= 0) return null
  return `${((size.dailyLoss / size.balance) * 100).toFixed(1)}%`
}

function getDrawdownPercent(size: AccountSizeEntry[1]): string {
  return `${((size.drawdown / size.balance) * 100).toFixed(1)}%`
}

function getDailyLossValue(size: AccountSizeEntry[1]): string {
  return size.dailyLoss !== null ? formatFirmCurrency(size.dailyLoss) : 'No limit'
}

function ChallengeStat({ label, value, note }: { label: string; value: string; note?: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground/95">{value}</p>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}

function ChallengePrice({
  size,
}: {
  size: AccountSizeEntry[1]
}) {
  const hasPromoPrice = size.priceWithPromo > 0 && size.priceWithPromo < size.price
  const promoDiscount = hasPromoPrice && size.price > 0
    ? `${Math.round((1 - size.priceWithPromo / size.price) * 100)}% OFF`
    : null

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Price</p>
      <div className="mt-1 flex items-baseline gap-2">
        {hasPromoPrice ? (
          <>
            <span className="text-lg font-semibold text-foreground/95">{formatFirmCurrency(size.priceWithPromo)}</span>
            <span className="text-sm text-muted-foreground line-through">{formatFirmCurrency(size.price)}</span>
            {promoDiscount ? (
              <Badge variant="accent" className="text-[10px]">
                {promoDiscount}
              </Badge>
            ) : null}
          </>
        ) : (
          <span className="text-lg font-semibold text-foreground/95">
            {size.price === 0 ? 'Included' : formatFirmCurrency(size.price)}
          </span>
        )}
      </div>
    </div>
  )
}

function ChallengesSection({ accountSizes, profitSplit }: { accountSizes: FirmData['accountSizes']; profitSplit: string }) {
  const entries = getAccountSizeEntries(accountSizes)

  if (entries.length === 0) {
    return (
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-v2-accent" />
            <CardTitle className="text-2xl text-foreground/95">Challenge sizes</CardTitle>
          </div>
          <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
            No challenge size data is available in the current snapshot. The overview above still covers the current platform, payout model, and allocation details.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-v2-accent" />
          <CardTitle className="text-2xl text-foreground/95">Challenge sizes</CardTitle>
        </div>
        <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Current account sizes, pricing, and trading limits from the live snapshot.
        </CardDescription>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {entries.map(([key, size]) => (
          <ChallengeCard key={key} size={size} profitSplit={profitSplit} />
        ))}
      </div>
    </div>
  )
}

function AdditionalDetailsSection({ firm }: { firm: FirmData }) {
  const details = buildAdditionalDetails(firm)

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-v2-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <CardTitle className="text-2xl text-foreground/95">Additional Details</CardTitle>
        </div>
        <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Key profile details pulled from the current firm record and verified public sources.
        </CardDescription>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label} className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-white/[0.05]">
                  <detail.icon className="h-4 w-4 text-v2-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{detail.label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground/95">{detail.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewSection({ firm }: { firm: FirmData }) {
  const overviewFacts = buildOverviewFacts(firm)
  const trustMetrics = buildTrustMetrics(firm)
  const researchSnapshot = buildResearchSnapshot(firm)
  const sourceNotes = getFirmSourceNotes().overview

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Research snapshot</p>
          <CardTitle className="mt-4 text-3xl text-foreground/95">A quick read on reviews, payouts, and fit.</CardTitle>
          <CardDescription className="mt-4 text-base leading-7 text-foreground/80">
            Use this snapshot to scan the current profile before opening the tabs below.
          </CardDescription>

          <div className="mt-5 flex flex-wrap gap-2">
            {['User reviews', 'Database payouts', 'Verified profile notes'].map((label) => (
              <Badge
                key={label}
                variant="default"
                className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
              >
                {label}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {researchSnapshot.map((item) => (
              <div key={item.label} className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-foreground/95">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.helper}</p>
              </div>
            ))}
          </div>

          {sourceNotes.length > 0 ? (
            <div className="mt-6 rounded-xl border border-border/40 bg-background/40 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Official source notes</p>
              <div className="mt-3 space-y-2">
                {sourceNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-v2-accent" />
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-xl border-border/40 bg-white/[0.05]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Profile summary</p>
            <CardTitle className="mt-4 text-3xl text-foreground/95">Firm profile at a glance</CardTitle>
            <CardDescription className="mt-4 text-base leading-7 text-foreground/80">
              {firm.description ?? firm.shortDesc ?? 'Structured company summary coming soon.'}
            </CardDescription>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {overviewFacts.map((fact) => (
                <FactTile key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/40 bg-white/[0.05]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Trust signals</p>
            <CardTitle className="mt-4 text-3xl text-foreground/95">What to check before you click out</CardTitle>
            <div className="mt-6 space-y-3">
              {trustChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-v2-accent" />
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trustMetrics.map((metric) => (
                <MetricCard key={metric.label} label={metric.label} value={metric.value} highlight={metric.highlight} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <AdditionalDetailsSection firm={firm} />

      {firm.referralUrl ? <ReferralCTA referralUrl={firm.referralUrl} /> : null}
    </div>
  )
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'text-yellow-400' : 'text-muted-foreground/40'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function SocialIcon({ type, url }: { type: 'website' | 'twitter' | 'discord' | 'telegram' | 'youtube'; url: string }) {
  const icons = {
    website: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    twitter: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    discord: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    telegram: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    youtube: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-white/[0.010] text-foreground/80 transition-colors hover:bg-white/[0.010] hover:text-foreground/95"
    >
      {icons[type]}
    </a>
  )
}

function PayoutHistorySection({ firm }: { firm: FirmData }) {
  const stats = firm.catalogueStats
  if (!stats) {
    return (
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-v2-accent" />
            <CardTitle className="text-2xl text-foreground/95">Payout History</CardTitle>
          </div>
          <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
            No payout data available in the current database snapshot.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  const avgPayout = stats.paidPayoutCount > 0 ? stats.paidPayoutAmount / stats.paidPayoutCount : 0

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-v2-accent" />
          <CardTitle className="text-2xl text-foreground/95">Payout History</CardTitle>
        </div>
        <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Aggregated payout statistics from tracked trader accounts in the database.
        </CardDescription>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Total Paid Out</p>
            <p className="mt-2 text-2xl font-semibold text-v2-success">{formatCompactCurrency(stats.paidPayoutAmount)}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Payouts Made</p>
            <p className="mt-2 text-2xl font-semibold text-foreground/95">{stats.paidPayoutCount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Avg Payout</p>
            <p className="mt-2 text-2xl font-semibold text-foreground/95">{formatCompactCurrency(avgPayout)}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-foreground/95">{formatCompactCurrency(stats.pendingPayoutAmount)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Payout Success Rate</p>
              <p className="mt-1 text-sm text-muted-foreground">Based on {stats.accountsCount.toLocaleString()} tracked accounts</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-v2-success">
                {stats.accountsCount > 0 ? Math.min(100, Math.round((stats.paidPayoutCount / stats.accountsCount) * 100)) : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ROISection({ firm }: { firm: FirmData }) {
  const accountSizes = firm.accountSizes ? Object.entries(firm.accountSizes) : []

  if (accountSizes.length === 0) {
    return (
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-v2-accent" />
            <CardTitle className="text-2xl text-foreground/95">ROI Analysis</CardTitle>
          </div>
          <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
            No account size data available for ROI comparison.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-v2-accent" />
          <CardTitle className="text-2xl text-foreground/95">ROI Analysis</CardTitle>
        </div>
        <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Illustrative fee-to-target comparison based on the current challenge templates and the published firm path.
        </CardDescription>

        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          This comparison helps you scan the current setup; it is not a promise of profit.
        </p>

        <div className="mt-6 grid gap-4">
          {accountSizes.map(([key, size]) => {
            const roiPotential = size.target > 0 && size.price > 0
              ? Math.round((size.target / size.price) * 100)
              : 0
            const profitTargetPct = size.balance > 0
              ? ((size.target / size.balance) * 100).toFixed(1)
              : '0'

            return (
              <div key={key} className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground/95">{size.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCompactCurrency(size.balance)} account</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Challenge Fee</p>
                      <p className="mt-1 text-lg font-semibold text-foreground/95">
                        {size.price > 0 ? formatCompactCurrency(size.price) : 'Free'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Profit Target</p>
                      <p className="mt-1 text-lg font-semibold text-foreground/95">{profitTargetPct}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">ROI Potential</p>
                      <p className={`mt-1 text-lg font-semibold ${roiPotential > 200 ? 'text-v2-success' : 'text-foreground/95'}`}>
                        {roiPotential > 0 ? `${roiPotential}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RulesSection({ firm }: { firm: FirmData }) {
  const accountSizes = getAccountSizeEntries(firm.accountSizes)
  const rules = buildRules(firm)
  const sourceNotes = getFirmSourceNotes().rules

  return (
    <div className="space-y-5">
      <Card className="rounded-xl border-border/40 bg-white/[0.05]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-v2-accent" />
            <CardTitle className="text-2xl text-foreground/95">Trading Rules</CardTitle>
          </div>
          <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
            Key trading rules and restrictions from the current profile and challenge templates.
          </CardDescription>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {rules.map((rule) => (
              <div key={rule.title} className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{rule.title}</p>
                <p className="mt-2 text-xl font-semibold text-foreground/95">{rule.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>

          {sourceNotes.length > 0 ? (
            <div className="mt-6 rounded-xl border border-border/40 bg-background/40 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Official rule notes</p>
              <div className="mt-3 space-y-2">
                {sourceNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-v2-accent" />
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {accountSizes.length > 0 && (
        <Card className="rounded-xl border-border/40 bg-white/[0.05]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-v2-accent" />
              <CardTitle className="text-2xl text-foreground/95">Risk Parameters</CardTitle>
            </div>
            <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
              Loss limits and drawdown rules for each account size.
            </CardDescription>

            <div className="mt-6 grid gap-3 lg:hidden">
              {accountSizes.map(([key, size]) => (
                <article key={key} className="rounded-xl border border-white/[0.08] bg-background/50 p-4">
                  <h3 className="text-base font-semibold text-foreground/95">{size.name}</h3>
                  <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Daily Loss</dt>
                      <dd className="mt-1 font-medium text-foreground/95">
                        {size.dailyLoss !== null ? formatCompactCurrency(size.dailyLoss) : 'No limit'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Max Drawdown</dt>
                      <dd className="mt-1 font-medium text-foreground/95">{formatCompactCurrency(size.drawdown)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Profit Target</dt>
                      <dd className="mt-1 font-medium text-foreground/95">{formatCompactCurrency(size.target)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-6 hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Account</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Daily Loss</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Max Drawdown</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Profit Target</th>
                  </tr>
                </thead>
                <tbody>
                  {accountSizes.map(([key, size]) => (
                    <tr key={key} className="border-b border-border/20">
                      <td className="px-4 py-3 font-medium text-foreground/95">{size.name}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {size.dailyLoss !== null ? formatCompactCurrency(size.dailyLoss) : 'No limit'}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCompactCurrency(size.drawdown)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCompactCurrency(size.target)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PayoutProofSection({ firm }: { firm: FirmData }) {
  const stats = firm.catalogueStats

  return (
    <Card className="rounded-xl border-border/40 bg-white/[0.05]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-v2-accent" />
          <CardTitle className="text-2xl text-foreground/95">Payout Proof</CardTitle>
        </div>
        <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Payout evidence pulled from tracked trader records in the database.
        </CardDescription>

        {stats && stats.paidPayoutCount > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Verified Payouts</p>
                  <p className="mt-2 text-3xl font-semibold text-v2-success">{stats.paidPayoutCount.toLocaleString()}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-v2-success/10">
                  <Check className="h-6 w-6 text-v2-success" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Total Paid</p>
                <p className="mt-2 text-2xl font-semibold text-foreground/95">{formatCompactCurrency(stats.paidPayoutAmount)}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Active Accounts</p>
                <p className="mt-2 text-2xl font-semibold text-foreground/95">{stats.accountsCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Account Size Distribution</p>
              <p className="mt-2 text-sm text-foreground/95">{stats.sizeBreakdown}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03]">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-medium text-foreground/95">No payout proof yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Payout data will appear here as tracked trader records accumulate in the database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function HeaderRatingSummary({
  spotlightRating,
  headerMetaItems,
}: {
  spotlightRating: number | null
  headerMetaItems: string[]
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      {spotlightRating !== null ? (
        <>
          <StarRating rating={Math.round(spotlightRating)} size="lg" />
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground/95">{spotlightRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">No approved user rating yet</span>
      )}
      {headerMetaItems.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border/40 bg-background/45 px-2.5 py-1 text-xs text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function HeaderActions({ referralUrl }: { referralUrl?: string | null }) {
  if (!referralUrl) return null

  return (
    <div className="flex flex-col items-start gap-4 lg:items-end">
      <div className="flex items-center gap-3">
        <SocialIcon type="website" url={referralUrl} />
      </div>

      <a
        href={referralUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-5 py-2.5 text-sm font-semibold text-v2-accent-foreground transition-colors hover:bg-v2-accent-hover"
      >
        Visit Official Website
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}

function HeaderRadarMini({ firm }: { firm: FirmData }) {
  const metrics = buildRadarMetrics(firm)
  const chartData = metrics.map((metric) => ({
    metric: metric.label,
    score: metric.value,
  }))
  const averageScore = metrics.length > 0
    ? Math.round(metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length)
    : 0

  return (
    <div className="w-full lg:w-auto">
      <Card className="w-full rounded-xl border-border/20 bg-[linear-gradient(160deg,hsl(var(--background)/0.78),hsl(var(--card)/0.45))] lg:w-[276px]">
        <CardContent className="flex flex-col items-center p-3.5">
          <p className="text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Radar Snapshot</p>
          <ChartContainer
            config={radarChartConfig}
            className="mx-auto mt-2.5 aspect-square max-h-[220px] w-full"
          >
            <RadarChart data={chartData}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${Number(value).toLocaleString()}/100`, 'Score']}
                  />
                }
              />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <PolarGrid />
              <Radar
                dataKey="score"
                fill="var(--color-score)"
                fillOpacity={0.45}
                stroke="var(--color-score)"
                strokeWidth={2}
                dot={{ r: 3.5, fill: 'var(--color-score)', fillOpacity: 1 }}
              />
            </RadarChart>
          </ChartContainer>
          <p className="mt-1.5 text-center text-xs text-muted-foreground">{`Live score: ${averageScore}/100`}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function FirmHeader({ firm }: { firm: FirmData }) {
  const spotlightRating = firm.spotlight?.rating ?? null
  const spotlightPromoText = firm.spotlight?.promoText
  const headerMetaItems = buildHeaderMetaItems(firm)
  const headerMetrics = buildHeaderMetrics(firm)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/20 bg-[linear-gradient(160deg,hsl(var(--background))_0%,hsl(var(--card))_100%)] p-5 shadow-[0_36px_110px_-66px_hsl(0_0%_0%_/0.95)] sm:p-7 lg:p-9">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(88,129,255,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(28,200,138,0.12),_transparent_40%)]" />
      <div className="relative space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_276px] lg:items-start">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white/[0.010] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_48px_-16px_rgba(0,0,0,0.5)] shadow-foreground/20">
              {firm.logoUrl ? (
                <Image
                  src={firm.logoUrl}
                  alt={`${firm.name} logo`}
                  width={72}
                  height={72}
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-v2-accent">
                  {firmInitials(firm.name)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={formatCategoryTone(firm.category)}>{firm.category}</Badge>
                <Badge variant="default">{firm.platform ?? 'Platform pending'}</Badge>
                {firm.payoutModel && (
                  <Badge variant="default">{firm.payoutModel}</Badge>
                )}
              </div>
              
              <h1 className="mt-3 text-[clamp(2.2rem,5.8vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.04em] text-foreground/95">
                {firm.name}
                {spotlightPromoText && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-v2-accent px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-v2-accent-foreground">
                    {spotlightPromoText}
                  </span>
                )}
              </h1>

              <HeaderRatingSummary spotlightRating={spotlightRating} headerMetaItems={headerMetaItems} />
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Approved trader reviews sit beside database-backed payout totals and verified profile notes, so the tabs below stay grounded in source data.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-4 lg:items-end">
            <HeaderRadarMini firm={firm} />
            <HeaderActions referralUrl={firm.referralUrl} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headerMetrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function FirmDetailClient({ firm, localePrefix }: { firm: FirmData; localePrefix: string }) {
  const [activeTab, setActiveTab] = React.useState('overview')
  const visibleReviewCount = getVisibleReviewCount(firm)
  const visibleCouponCount = getVisibleCouponCount(firm)

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(88,129,255,0.08),transparent_34%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_24%,hsl(var(--background))_100%)]">
      <div className="mx-auto w-full max-w-[1240px] flex-1 overflow-y-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <FirmHeader firm={firm} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-7">
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-xl border border-border/20 bg-background/70 p-2">
            {[
              ['overview', 'Overview'],
              ['challenges', 'Challenges'],
              ['rules', 'Rules'],
              ['roi', 'ROI'],
              ['payouts', 'Payouts'],
              ['proof', 'Payout Proof'],
              ['reviews', `Reviews (${visibleReviewCount})`],
              ['coupons', `Coupons (${visibleCouponCount})`],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  'shrink-0 rounded-xl border border-transparent px-4 py-2.5 text-sm text-foreground/80 transition-colors',
                  'hover:border-border/20 hover:bg-white/[0.050]',
                  'data-[state=active]:border-v2-accent/30 data-[state=active]:bg-v2-accent data-[state=active]:text-v2-accent-foreground'
                )}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-5">
            <OverviewSection firm={firm} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-5">
            <ChallengesSection accountSizes={firm.accountSizes} profitSplit={firm.profitSplit ?? 'N/A'} />
          </TabsContent>

          <TabsContent value="rules" className="mt-5">
            <RulesSection firm={firm} />
          </TabsContent>

          <TabsContent value="roi" className="mt-5">
            <ROISection firm={firm} />
          </TabsContent>

          <TabsContent value="payouts" className="mt-5">
            <PayoutHistorySection firm={firm} />
          </TabsContent>

          <TabsContent value="proof" className="mt-5">
            <PayoutProofSection firm={firm} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-5">
            <FirmReviewsSection firmId={firm.id} />
          </TabsContent>

          <TabsContent value="coupons" className="mt-5">
            <FirmCouponsSection firmId={firm.id} localePrefix={localePrefix} referralUrl={firm.referralUrl} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
