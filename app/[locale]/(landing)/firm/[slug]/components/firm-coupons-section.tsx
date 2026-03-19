"use client"
import React from 'react'
import { listFirmCoupons } from '@/server/firm-coupons'
import { CardV2, BadgeV2, SkeletonV2 } from '@/components/ui/v2'
import { DealsIcon } from '@/components/icons/svg-icons'

export function FirmCouponsSection({ firmId }: { firmId: string }) {
  const [coupons, setCoupons] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!firmId) return
    listFirmCoupons(firmId)
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }, [firmId])

  return (
    <CardV2 className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DealsIcon size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-v2-text-primary">Coupons</span>
        <span className="text-xs text-v2-text-tertiary">({coupons.length})</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonV2 className="h-16" />
          <SkeletonV2 className="h-16" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-sm text-v2-text-secondary py-4 text-center">No coupons available.</div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="p-4 rounded-v2-md bg-v2-bg-elevated border border-v2-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-v2-accent bg-v2-accent-subtle px-2 py-1 rounded">
                  {coupon.code}
                </span>
                <BadgeV2 variant="accent">{coupon.discountPercent}% off</BadgeV2>
              </div>
              {coupon.challengeFee && (
                <div className="text-xs text-v2-text-secondary mt-1">
                  Challenge fee: ${coupon.challengeFee}
                </div>
              )}
              {coupon.expiresAt && (
                <div className="text-xs text-v2-text-tertiary mt-1">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </div>
              )}
              {coupon.claimUrl && (
                <a
                  href={coupon.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-v2-accent hover:underline"
                >
                  Claim coupon →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </CardV2>
  )
}
