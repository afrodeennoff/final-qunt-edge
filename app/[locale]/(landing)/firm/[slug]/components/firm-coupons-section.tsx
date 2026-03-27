"use client"
import React from 'react'
import { listFirmCoupons } from '@/server/firm-coupons'
import { CardV2, CardV2Description, BadgeV2, SkeletonV2 } from '@/components/ui/v2'
import { DealsIcon } from '@/components/icons/svg-icons'
import { formatCompactCurrency } from '@/lib/formatting/currency'

type FirmCouponItem = Awaited<ReturnType<typeof listFirmCoupons>>[number]

export function FirmCouponsSection({ firmId }: { firmId: string }) {
  const [coupons, setCoupons] = React.useState<FirmCouponItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!firmId) return
    listFirmCoupons(firmId)
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }, [firmId])

  return (
    <CardV2 className="rounded-[30px] border-border/40 bg-card/5 p-6">
      <div className="mb-2 flex items-center gap-2">
        <DealsIcon size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-foreground">Current coupons</span>
        <span className="text-xs text-muted-foreground">({coupons.length})</span>
      </div>
      <CardV2Description className="mb-4 text-sm leading-6 text-muted-foreground">
        Active codes tied to this firm record in the current snapshot.
      </CardV2Description>

      {loading ? (
        <div className="space-y-3">
          <SkeletonV2 className="h-16" />
          <SkeletonV2 className="h-16" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 py-8 text-center text-sm text-muted-foreground">
          No active coupons in the current database snapshot.
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-2xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-v2-accent bg-v2-accent-subtle px-2 py-1 rounded">
                  {coupon.code}
                </span>
                <BadgeV2 variant="accent">{coupon.discountPercent}% off</BadgeV2>
              </div>
              {coupon.challengeFee !== null && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Challenge fee: {formatCompactCurrency(coupon.challengeFee)}
                </div>
              )}
              {coupon.expiresAt && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </div>
              )}
              {coupon.claimUrl && (
                <a
                  href={coupon.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-v2-accent hover:underline"
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
