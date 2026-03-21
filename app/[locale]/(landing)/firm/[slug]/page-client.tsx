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
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-v2-accent" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
          <p className="mt-2 text-sm font-semibold text-white">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
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
    <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
      <CardV2Content className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Referral link</p>
          <CardV2Title className="mt-3 text-2xl text-white">Open the official company site.</CardV2Title>
          <CardV2Description className="mt-3 text-sm leading-7 text-white/58">
            Use the firm link below if you want to continue from research into signup.
          </CardV2Description>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
            <code className="min-w-0 flex-1 truncate text-xs text-white/60">{referralUrl}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.08]"
              title="Copy link"
              type="button"
            >
              {copied ? <Check className="h-4 w-4 text-v2-accent" /> : <Copy className="h-4 w-4 text-white/55" />}
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

function ChallengesSection() {
  return (
    <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
      <CardV2Content className="p-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-v2-accent" />
          <CardV2Title className="text-2xl text-white">Challenge dashboard</CardV2Title>
        </div>
        <CardV2Description className="mt-3 text-sm leading-7 text-white/58">
          Challenge-level breakdowns are still being filled in. The page already exposes the firm summary, reviews, and live coupons in the same dashboard layout.
        </CardV2Description>
        <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-black/25 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <Clock className="h-5 w-5 text-white/45" />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">Detailed challenge rows coming next.</p>
          <p className="mt-2 text-sm text-white/55">This slot is reserved for phase pricing, targets, and rule-specific challenge data.</p>
        </div>
      </CardV2Content>
    </CardV2>
  )
}

function OverviewSection({ firm }: { firm: FirmData }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Company dashboard</p>
            <CardV2Title className="mt-4 text-3xl text-white">Prop firm profile overview</CardV2Title>
            <CardV2Description className="mt-4 text-base leading-7 text-white/60">
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

        <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
          <CardV2Content className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Trust view</p>
            <CardV2Title className="mt-4 text-3xl text-white">What to check before you click out</CardV2Title>
            <div className="mt-6 space-y-3">
              {trustChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-v2-accent" />
                  <p className="text-sm leading-7 text-white/58">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Reviews" value={(firm._count?.reviews ?? 0).toLocaleString()} />
              <MetricCard label="Coupons" value={(firm._count?.coupons ?? 0).toLocaleString()} />
            </div>
          </CardV2Content>
        </CardV2>
      </section>

      {firm.referralUrl ? <ReferralCTA referralUrl={firm.referralUrl} /> : null}
    </div>
  )
}

function FirmHeader({ firm }: { firm: FirmData }) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black/40 p-6 sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(88,129,255,0.2),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(28,200,138,0.12),_transparent_36%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.04] overflow-hidden">
              {firm.logoUrl ? (
                <Image
                  src={firm.logoUrl}
                  alt={`${firm.name} logo`}
                  width={58}
                  height={58}
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-v2-accent">
                  {firmInitials(firm.name)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <BadgeV2 variant={formatCategoryTone(firm.category)}>{firm.category}</BadgeV2>
                <BadgeV2 variant="default">{firm.platform ?? 'Platform pending'}</BadgeV2>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">{firm.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                {firm.shortDesc ?? firm.description ?? 'Structured prop firm profile with reviews, coupons, and rule context.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="Profit split" value={firm.profitSplit ?? 'N/A'} />
          <MetricCard label="Max allocation" value={firm.maxAllocation ?? 'N/A'} />
          <MetricCard label="Reviews" value={(firm._count?.reviews ?? 0).toLocaleString()} />
          <MetricCard label="Coupons" value={(firm._count?.coupons ?? 0).toLocaleString()} />
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
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[22px] border border-white/10 bg-white/[0.03] p-2">
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
                  'rounded-2xl px-4 py-2.5 text-sm text-white/60 transition-colors',
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
            <ChallengesSection />
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
