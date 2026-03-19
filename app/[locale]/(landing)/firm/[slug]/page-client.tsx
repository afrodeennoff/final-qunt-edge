"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { CardV2, BadgeV2, SkeletonV2 } from '@/components/ui/v2'
import { FirmIcon } from '@/components/icons/svg-icons'

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

export function FirmDetailClient({ firm }: { firm: FirmData }) {
  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FirmHeader firm={firm} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <CardV2 className="p-6">
              <h3 className="text-lg font-semibold text-v2-text-primary mb-4">Challenge Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <div className="text-v2-text-tertiary mb-1">Payout Model</div>
                  <div className="text-v2-text-primary font-medium">{firm.payoutModel ?? '—'}</div>
                </div>
                <div>
                  <div className="text-v2-text-tertiary mb-1">Drawdown Type</div>
                  <div className="text-v2-text-primary font-medium">{firm.drawdownType ?? '—'}</div>
                </div>
                <div>
                  <div className="text-v2-text-tertiary mb-1">Profit Split</div>
                  <div className="text-v2-text-primary font-medium">{firm.profitSplit ?? '—'}</div>
                </div>
                <div>
                  <div className="text-v2-text-tertiary mb-1">Max Allocation</div>
                  <div className="text-v2-text-primary font-medium">{firm.maxAllocation ?? '—'}</div>
                </div>
                <div>
                  <div className="text-v2-text-tertiary mb-1">Platform</div>
                  <div className="text-v2-text-primary font-medium">{firm.platform ?? '—'}</div>
                </div>
                <div>
                  <div className="text-v2-text-tertiary mb-1">Category</div>
                  <BadgeV2 variant={firm.category === 'Futures' ? 'default' : 'accent'}>{firm.category}</BadgeV2>
                </div>
              </div>
            </CardV2>

            {firm.referralUrl && (
              <CardV2 className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-v2-text-primary">Ready to start?</div>
                    <div className="text-xs text-v2-text-secondary mt-1">Use our referral link for the best deal</div>
                  </div>
                  <a
                    href={firm.referralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-v2-accent text-white text-sm font-medium rounded-v2-md hover:bg-v2-accent/90 transition-colors"
                  >
                    Start Challenge
                  </a>
                </div>
              </CardV2>
            )}

            <FirmReviewsSection firmId={firm.id} />
          </div>

          <div className="space-y-6">
            <FirmCouponsSection firmId={firm.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

function FirmHeader({ firm }: { firm: FirmData }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-v2-bg-surface rounded-v2-lg border border-v2-border">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-v2-lg bg-v2-accent-subtle">
        <FirmIcon size={32} className="text-v2-accent" />
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
