"use client"

import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BadgeV2, CardV2, CardV2Content, CardV2Description, CardV2Title, SkeletonV2 } from '@/components/ui/v2'
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
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FirmReviewsSection = dynamic(
  () => import('./components/firm-reviews-section').then((m) => ({ default: m.FirmReviewsSection })),
  {
    loading: () => <CardV2 className="p-6"><SkeletonV2 className="h-48" /></CardV2>,
    ssr: false,
  }
)

const FirmCouponsSection = dynamic(
  () => import('./components/firm-coupons-section').then((m) => ({ default: m.FirmCouponsSection })),
  {
    loading: () => <CardV2 className="p-6"><SkeletonV2 className="h-32" /></CardV2>,
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
}

const trustChecklist = [
  'Structured company facts and trading rule context.',
  'Review and coupon tabs stay connected to the same profile.',
  'Cleaner hierarchy for scanning payouts, split, and platform details.',
]

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

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
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
    <div className="rounded-2xl border border-border/40 bg-background/40 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-card/5">
          <Icon className="h-4 w-4 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/5 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.03em] ${highlight ? 'text-v2-success' : 'text-foreground'}`}>{value}</p>
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
    <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
      <CardV2Content className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Referral link</p>
          <CardV2Title className="mt-3 text-2xl text-foreground">Open the official company site.</CardV2Title>
          <CardV2Description className="mt-3 text-sm leading-7 text-muted-foreground">
            Use the firm link below if you want to continue from research into signup.
          </CardV2Description>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/40 bg-background/50 px-3 py-3">
            <code className="min-w-0 flex-1 truncate text-xs text-foreground/80">{referralUrl}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-xl border border-border/40 bg-card/5 p-2 transition-colors hover:bg-card/10"
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
          className="inline-flex items-center justify-center gap-2 rounded-full bg-v2-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-v2-accent-hover"
        >
          Visit Firm
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardV2Content>
    </CardV2>
  )
}

function ChallengesSection({ accountSizes, profitSplit }: { accountSizes: FirmData['accountSizes']; profitSplit: string }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const entries = accountSizes ? Object.entries(accountSizes) : []

  if (entries.length === 0) {
    return (
      <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
        <CardV2Content className="p-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-v2-accent" />
            <CardV2Title className="text-2xl text-foreground">Challenge Types</CardV2Title>
          </div>
          <CardV2Description className="mt-3 text-sm leading-7 text-muted-foreground">
            No challenge data available for this firm yet.
          </CardV2Description>
        </CardV2Content>
      </CardV2>
    )
  }

  return (
    <div className="space-y-6">
      <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
        <CardV2Content className="p-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-v2-accent" />
            <CardV2Title className="text-2xl text-foreground">Challenge Types</CardV2Title>
          </div>
          <CardV2Description className="mt-3 text-sm leading-7 text-muted-foreground">
            Detailed breakdown of available account sizes, pricing, and trading rules.
          </CardV2Description>
        </CardV2Content>
      </CardV2>

      <div className="grid gap-4">
        {entries.map(([key, size]) => (
          <CardV2 key={key} className="rounded-[30px] border-border/40 bg-card/5">
            <CardV2Content className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BadgeV2 variant={size.evaluation ? 'accent' : 'default'}>
                      {size.name}
                    </BadgeV2>
                    {!size.evaluation && (
                      <BadgeV2 variant="default">Direct Funded</BadgeV2>
                    )}
                    {size.trailing && (
                      <BadgeV2 variant="default">{size.trailing}</BadgeV2>
                    )}
                  </div>
                  
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Account Size</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{formatCurrency(size.balance)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Profit Target</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{formatCurrency(size.target)}</p>
                      {size.target > 0 && (
                        <p className="text-xs text-muted-foreground">{((size.target / size.balance) * 100).toFixed(1)}%</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Max Daily Loss</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {size.dailyLoss !== null ? formatCurrency(size.dailyLoss) : 'No limit'}
                      </p>
                      {size.dailyLoss !== null && size.dailyLoss > 0 && (
                        <p className="text-xs text-muted-foreground">{((size.dailyLoss / size.balance) * 100).toFixed(1)}%</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Max Drawdown</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">{formatCurrency(size.drawdown)}</p>
                      <p className="text-xs text-muted-foreground">{((size.drawdown / size.balance) * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Profit Split</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{size.profitSharing}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Evaluation</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{size.evaluation ? 'Required' : 'None'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        {size.priceWithPromo > 0 && size.priceWithPromo < size.price ? (
                          <>
                            <span className="text-lg font-semibold text-foreground">{formatCurrency(size.priceWithPromo)}</span>
                            <span className="text-sm text-muted-foreground line-through">{formatCurrency(size.price)}</span>
                            <BadgeV2 variant="accent" className="text-[10px]">
                              {Math.round((1 - size.priceWithPromo / size.price) * 100)}% OFF
                            </BadgeV2>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-foreground">
                            {size.price === 0 ? 'Included' : formatCurrency(size.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Profit Split (Firm)</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{profitSplit ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardV2Content>
          </CardV2>
        ))}
      </div>
    </div>
  )
}

function AdditionalDetailsSection({ firm }: { firm: FirmData }) {
  const details = [
    {
      icon: Building2,
      label: 'Founded',
      value: '2020',
    },
    {
      icon: Landmark,
      label: 'Headquarters',
      value: 'United States',
    },
    {
      icon: Shield,
      label: 'Regulated',
      value: 'Yes',
    },
    {
      icon: Wallet,
      label: 'Accepted Countries',
      value: 'Worldwide',
    },
    {
      icon: DollarSign,
      label: 'Payment Methods',
      value: 'Credit Card, Crypto, Bank Transfer',
    },
    {
      icon: Clock,
      label: 'Payout Frequency',
      value: firm.payoutModel ?? 'Monthly',
    },
    {
      icon: Layers,
      label: 'Platforms',
      value: firm.platform ?? 'MetaTrader 4/5, cTrader',
    },
  ]

  return (
    <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
      <CardV2Content className="p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-v2-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <CardV2Title className="text-2xl text-foreground">Additional Details</CardV2Title>
        </div>
        <CardV2Description className="mt-3 text-sm leading-7 text-muted-foreground">
          Key information about the firm including founding details, regulatory status, and supported platforms.
        </CardV2Description>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label} className="rounded-2xl border border-border/40 bg-background/40 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-card/5">
                  <detail.icon className="h-4 w-4 text-v2-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{detail.label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{detail.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardV2Content>
    </CardV2>
  )
}

function OverviewSection({ firm }: { firm: FirmData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Company dashboard</p>
            <CardV2Title className="mt-4 text-3xl text-foreground">Prop firm profile overview</CardV2Title>
            <CardV2Description className="mt-4 text-base leading-7 text-foreground/80">
              {firm.description ?? firm.shortDesc ?? 'Structured company summary coming soon.'}
            </CardV2Description>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FactTile icon={Layers} label="Platform" value={firm.platform ?? 'N/A'} />
              <FactTile icon={Wallet} label="Payout model" value={firm.payoutModel ?? 'N/A'} />
              <FactTile icon={Shield} label="Drawdown type" value={firm.drawdownType ?? 'N/A'} />
              <FactTile icon={DollarSign} label="Profit split" value={firm.profitSplit ?? 'N/A'} />
              <FactTile icon={Landmark} label="Max allocation" value={firm.maxAllocation ?? 'N/A'} />
              <FactTile icon={Building2} label="Category" value={firm.category ?? 'N/A'} />
            </div>
          </CardV2Content>
        </CardV2>

        <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Trust view</p>
            <CardV2Title className="mt-4 text-3xl text-foreground">What to check before you click out</CardV2Title>
            <div className="mt-6 space-y-3">
              {trustChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-v2-accent" />
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
            
            {firm.catalogueStats && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Accounts" value={firm.catalogueStats.accountsCount.toLocaleString()} />
                <MetricCard label="Total Value" value={formatCompactCurrency(firm.catalogueStats.totalAccountValue)} highlight />
                <MetricCard label="Paid Out" value={formatCompactCurrency(firm.catalogueStats.paidPayoutAmount)} highlight />
                <MetricCard label="Payout Count" value={firm.catalogueStats.paidPayoutCount.toLocaleString()} />
              </div>
            )}
            
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Reviews" value={(firm._count?.reviews ?? 0).toLocaleString()} />
              <MetricCard label="Coupons" value={(firm._count?.coupons ?? 0).toLocaleString()} />
            </div>
          </CardV2Content>
        </CardV2>
      </section>

      <RADARAnalysisWidget firm={firm} />
      
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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-card/10 text-foreground/80 transition-colors hover:bg-card/10 hover:text-foreground"
    >
      {icons[type]}
    </a>
  )
}

function RADARAnalysisWidget({ firm }: { firm: FirmData }) {
  const accountsFunded = Math.min(100, Math.round(((firm.catalogueStats?.accountsCount ?? 0) / 100) * 100))
  const payoutsMade = Math.min(100, Math.round(((firm.catalogueStats?.paidPayoutCount ?? 0) / 50) * 100))
  const consistencyScore = Math.round(((firm.spotlight?.rating ?? 4.0) / 5) * 100)
  const reviewCount = firm._count?.reviews ?? 0
  const supportQuality = Math.min(100, Math.round((reviewCount / 20) * 100))
  const drawdownType = firm.drawdownType ?? 'Static'
  const ruleFlexibility = drawdownType === 'Static' ? 80 : drawdownType === 'Trailing' ? 70 : 75
  const avgPayout = firm.catalogueStats?.paidPayoutAmount ?? 0
  const payoutCount = firm.catalogueStats?.paidPayoutCount ?? 1
  const avgPayoutPerAccount = payoutCount > 0 ? avgPayout / payoutCount : 0
  const valueForMoney = Math.min(100, Math.round((avgPayoutPerAccount / 10000) * 100))

  const metrics = [
    { label: 'Total Accounts Funded', value: accountsFunded, max: 100 },
    { label: 'Total Payouts Made', value: payoutsMade, max: 100 },
    { label: 'Consistency Score', value: consistencyScore, max: 100 },
    { label: 'Support Quality', value: supportQuality, max: 100 },
    { label: 'Rule Flexibility', value: ruleFlexibility, max: 100 },
    { label: 'Value for Money', value: valueForMoney, max: 100 },
  ]

  const centerX = 150
  const centerY = 150
  const radius = 120
  const angleStep = (2 * Math.PI) / metrics.length

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    }
  }

  const pathData = metrics
    .map((metric, index) => {
      const point = getPoint(index, metric.value)
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    })
    .join(' ') + ' Z'

  return (
    <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
      <CardV2Content className="p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-v2-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <CardV2Title className="text-2xl text-foreground">RADAR Analysis</CardV2Title>
        </div>
        <CardV2Description className="mt-3 text-sm leading-7 text-muted-foreground">
          Performance metrics derived from platform data and user reviews.
        </CardV2Description>

        <div className="mt-6 flex flex-col items-center">
          <svg width="300" height="300" viewBox="0 0 300 300" className="w-full max-w-[300px]">
            {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
              <polygon
                key={scale}
                points={metrics
                  .map((_, index) => {
                    const point = getPoint(index, scale * 100)
                    return `${point.x},${point.y}`
                  })
                  .join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}

            {metrics.map((_, index) => {
              const point = getPoint(index, 100)
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              )
            })}

            <polygon
              points={metrics
                .map((_, index) => {
                  const point = getPoint(index, metrics[index].value)
                  return `${point.x},${point.y}`
                })
                .join(' ')}
              fill="rgba(88,129,255,0.2)"
              stroke="rgba(88,129,255,0.8)"
              strokeWidth="2"
            />

            {metrics.map((metric, index) => {
              const point = getPoint(index, 110)
              return (
                <text
                  key={index}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground/70 text-[10px]"
                >
                  {metric.label}
                </text>
              )
            })}

            {metrics.map((metric, index) => {
              const point = getPoint(index, metric.value)
              return (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="rgba(88,129,255,1)"
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}
          </svg>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border/40 bg-background/40 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}/100</p>
              </div>
            ))}
          </div>
        </div>
      </CardV2Content>
    </CardV2>
  )
}

function FirmHeader({ firm }: { firm: FirmData }) {
  // Use spotlight data if available, otherwise fall back to defaults
  const spotlightRating = firm.spotlight?.rating ?? 4.2
  const spotlightReviewCount = firm.spotlight?.reviewCount ?? firm._count?.reviews ?? 0
  const spotlightPromoText = firm.spotlight?.promoText
  const spotlightMaxAllocation = firm.spotlight?.maxAllocation ?? firm.maxAllocation ?? '$100K'
  const spotlightCountryCode = firm.spotlight?.countryCode
  const spotlightFounded = firm.spotlight?.founded
  const spotlightYearsInOperation = firm.spotlight?.yearsInOperation
  
  const socialLinks = {
    website: firm.referralUrl,
    twitter: undefined,
    discord: undefined,
    telegram: undefined,
    youtube: undefined,
  }

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-border/40 bg-background/80 p-6 sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(88,129,255,0.2),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(28,200,138,0.12),_transparent_36%)]" />
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-border/40 bg-card/10 overflow-hidden shadow-lg shadow-black/20">
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
                <BadgeV2 variant={formatCategoryTone(firm.category)}>{firm.category}</BadgeV2>
                <BadgeV2 variant="default">{firm.platform ?? 'Platform pending'}</BadgeV2>
                {firm.payoutModel && (
                  <BadgeV2 variant="default">{firm.payoutModel}</BadgeV2>
                )}
              </div>
              
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                {firm.name}
                {spotlightPromoText && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-v2-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-v2-accent-foreground">
                    {spotlightPromoText}
                  </span>
                )}
              </h1>
              
              <div className="mt-3 flex items-center gap-4">
                <StarRating rating={Math.round(spotlightRating)} size="lg" />
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{spotlightRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({spotlightReviewCount.toLocaleString()} {spotlightReviewCount === 1 ? 'review' : 'reviews'})
                </span>
                
                {spotlightYearsInOperation && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    • {spotlightYearsInOperation} years in operation
                  </span>
                )}
                {spotlightCountryCode && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    • {spotlightCountryCode}
                  </span>
                )}
                {spotlightFounded && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    • Founded {spotlightFounded}
                  </span>
                )}
              </div>
            </div>
          </div>
        
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="flex items-center gap-3">
              {socialLinks.website && (
                <SocialIcon type="website" url={socialLinks.website} />
              )}
              {socialLinks.twitter && (
                <SocialIcon type="twitter" url={socialLinks.twitter} />
              )}
              {socialLinks.discord && (
                <SocialIcon type="discord" url={socialLinks.discord} />
              )}
              {socialLinks.telegram && (
                <SocialIcon type="telegram" url={socialLinks.telegram} />
              )}
              {socialLinks.youtube && (
                <SocialIcon type="youtube" url={socialLinks.youtube} />
              )}
            </div>
            
            {firm.referralUrl && (
              <a
                href={firm.referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-v2-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-v2-accent-hover"
              >
                Visit Official Website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Profit Split" value={firm.profitSplit ?? 'N/A'} />
            <MetricCard label="Max Allocation" value={spotlightMaxAllocation} />
            <MetricCard label="Drawdown Type" value={firm.drawdownType ?? 'N/A'} />
            <MetricCard label="Active Coupons" value={(firm._count?.coupons ?? 0).toLocaleString()} />
          </div>
        </div>
      </div>
    </section>
  )
}

 export function FirmDetailClient({ firm }: { firm: FirmData }) {
  const [activeTab, setActiveTab] = React.useState('overview')

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <FirmHeader firm={firm} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[22px] border border-border/40 bg-card/5 p-2">
            {[
              ['overview', 'Overview'],
              ['challenges', 'Challenges'],
              ['reviews', `Reviews (${firm._count?.reviews ?? 0})`],
              ['coupons', `Coupons (${firm._count?.coupons ?? 0})`],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm text-foreground/80 transition-colors',
                  'data-[state=active]:bg-v2-accent data-[state=active]:text-black'
                )}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewSection firm={firm} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <ChallengesSection accountSizes={firm.accountSizes} profitSplit={firm.profitSplit ?? 'N/A'} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <FirmReviewsSection firmId={firm.id} />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <FirmCouponsSection firmId={firm.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
