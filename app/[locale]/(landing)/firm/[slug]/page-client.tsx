"use client"
import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, ExternalLink, TrendingUp, Shield, DollarSign, BarChart3, Clock, Target, Layers } from 'lucide-react'
import { CardV2, BadgeV2, SkeletonV2 } from '@/components/ui/v2'
import { FirmIcon } from '@/components/icons/svg-icons'
import { cn } from '@/lib/utils'

const FirmReviewsSection = dynamic(
  () => import('./components/firm-reviews-section').then(m => ({ default: m.FirmReviewsSection })),
  {
    loading: () => <CardV2 className="p-6"><SkeletonV2 className="h-48" /></CardV2>,
    ssr: false,
  }
)

const FirmCouponsSection = dynamic(
  () => import('./components/firm-coupons-section').then(m => ({ default: m.FirmCouponsSection })),
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

interface RuleCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}

function RuleCard({ icon: Icon, label, value }: RuleCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-v2-md bg-v2-bg-elevated border border-v2-border">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-v2-lg bg-v2-accent-subtle">
        <Icon size={18} className="text-v2-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-v2-text-tertiary mb-1">{label}</div>
        <div className="text-sm font-semibold text-v2-text-primary truncate">{value || '—'}</div>
      </div>
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
      // Fallback for older browsers
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
    <CardV2 className="p-6 border-v2-accent/30 bg-v2-accent-subtle">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-v2-text-primary">Ready to start?</div>
          <div className="text-xs text-v2-text-secondary mt-1 mb-3">Use our referral link for the best deal</div>
          <div className="flex items-center gap-2 p-2 rounded-v2-md bg-v2-bg-surface border border-v2-border">
            <code className="flex-1 text-xs text-v2-text-secondary truncate">{referralUrl}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded-v2-md hover:bg-v2-bg-elevated transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check size={14} className="text-v2-accent" />
              ) : (
                <Copy size={14} className="text-v2-text-tertiary" />
              )}
            </button>
          </div>
        </div>
        <a
          href={referralUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-v2-accent text-white text-sm font-semibold rounded-v2-md hover:bg-v2-accent/90 transition-colors"
        >
          Start Challenge
          <ExternalLink size={14} />
        </a>
      </div>
    </CardV2>
  )
}

function ChallengesSection() {
  return (
    <CardV2 className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-v2-text-primary">Challenges</span>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-v2-bg-elevated mb-4">
          <Clock size={24} className="text-v2-text-tertiary" />
        </div>
        <h3 className="text-sm font-medium text-v2-text-primary mb-2">Challenge details coming soon</h3>
        <p className="text-xs text-v2-text-secondary max-w-xs">
          We&apos;re working on adding detailed challenge information including phases, evaluation criteria, and pricing tiers.
        </p>
      </div>
    </CardV2>
  )
}

function RulesSection({ firm }: { firm: FirmData }) {
  const rules = [
    { icon: TrendingUp, label: 'Payout Model', value: firm.payoutModel },
    { icon: Shield, label: 'Drawdown Type', value: firm.drawdownType },
    { icon: DollarSign, label: 'Profit Split', value: firm.profitSplit },
    { icon: BarChart3, label: 'Max Allocation', value: firm.maxAllocation },
    { icon: Layers, label: 'Platform', value: firm.platform },
    { icon: Target, label: 'Category', value: firm.category },
  ]

  return (
    <CardV2 className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-v2-text-primary">Trading Rules</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rules.map((rule) => (
          <RuleCard
            key={rule.label}
            icon={rule.icon}
            label={rule.label}
            value={rule.value || '—'}
          />
        ))}
      </div>
    </CardV2>
  )
}

function OverviewSection({ firm }: { firm: FirmData }) {
  return (
    <div className="space-y-6">
      <RulesSection firm={firm} />
      {firm.referralUrl && <ReferralCTA referralUrl={firm.referralUrl} />}
    </div>
  )
}

function FirmHeader({ firm }: { firm: FirmData }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-v2-bg-surface rounded-v2-lg border border-v2-border">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-v2-lg bg-v2-accent-subtle overflow-hidden">
        {firm.logoUrl ? (
          <Image
            src={firm.logoUrl}
            alt={`${firm.name} logo`}
            width={48}
            height={48}
            className="object-contain"
            onError={(e) => {
              // Fallback to FirmIcon on error
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <FirmIcon size={32} className="text-v2-accent" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-v2-text-primary">{firm.name}</h1>
          <BadgeV2 variant={firm.category === 'Futures' ? 'default' : 'accent'}>{firm.category}</BadgeV2>
        </div>
        <p className="text-sm text-v2-text-secondary mt-1">{firm.shortDesc ?? firm.description ?? 'Prop trading firm'}</p>
        <div className="flex gap-4 mt-2 text-xs text-v2-text-tertiary">
          <span>{firm._count?.reviews ?? 0} reviews</span>
          <span>{firm._count?.coupons ?? 0} coupons</span>
        </div>
      </div>
    </div>
  )
}

export function FirmDetailClient({ firm }: { firm: FirmData }) {
  const [activeTab, setActiveTab] = React.useState('overview')

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FirmHeader firm={firm} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-v2-bg-surface border border-v2-border">
            <TabsTrigger
              value="overview"
              className={cn(
                "data-[state=active]:bg-v2-accent data-[state=active]:text-white",
                "text-v2-text-secondary hover:text-v2-text-primary"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className={cn(
                "data-[state=active]:bg-v2-accent data-[state=active]:text-white",
                "text-v2-text-secondary hover:text-v2-text-primary"
              )}
            >
              Challenges
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className={cn(
                "data-[state=active]:bg-v2-accent data-[state=active]:text-white",
                "text-v2-text-secondary hover:text-v2-text-primary"
              )}
            >
              Reviews ({firm._count?.reviews ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="coupons"
              className={cn(
                "data-[state=active]:bg-v2-accent data-[state=active]:text-white",
                "text-v2-text-secondary hover:text-v2-text-primary"
              )}
            >
              Coupons ({firm._count?.coupons ?? 0})
            </TabsTrigger>
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
