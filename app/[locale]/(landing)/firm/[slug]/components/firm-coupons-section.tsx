"use client"
import React from 'react'
import Link from 'next/link'
import { listFirmCoupons } from '@/server/firm-coupons'
import { Card, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DealsIcon } from '@/components/icons/svg-icons'
import { formatCompactCurrency } from '@/lib/formatting/currency'

type FirmCouponItem = Awaited<ReturnType<typeof listFirmCoupons>>[number]

export function FirmCouponsSection({
  firmId,
  localePrefix,
  referralUrl,
}: {
  firmId: string
  localePrefix: string
  referralUrl?: string | null
}) {
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
    <Card className="rounded-xl border-border/40 bg-background/35 p-6">
      <div className="mb-2 flex items-center gap-2">
        <DealsIcon size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-foreground">Current coupons</span>
        <span className="text-xs text-muted-foreground">({coupons.length})</span>
      </div>
      <CardDescription className="mb-4 text-sm leading-6 text-muted-foreground">
        Active codes tied to this firm record in the current snapshot.
      </CardDescription>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/30 bg-background/40 px-5 py-8 text-center text-sm text-muted-foreground">
          <p>No active coupons are currently tracked in the database snapshot.</p>
          <p className="mx-auto mt-2 max-w-lg leading-6">
            We only show live codes when the firm record has an active coupon attached. Check the Deals board for current offers or visit the official site for the firm&apos;s latest pricing.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href={`${localePrefix}/deals`}
              className="rounded-full bg-v2-accent px-4 py-2 text-xs font-semibold text-v2-accent-foreground transition-colors hover:bg-v2-accent-hover"
            >
              Browse Deals
            </Link>
            {referralUrl ? (
              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border/40 bg-background/50 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background/80"
              >
                Visit Official Site
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-xl border border-border/40 bg-background/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-v2-accent bg-v2-accent-subtle px-2 py-1 rounded">
                  {coupon.code}
                </span>
                <Badge variant="default">{coupon.discountPercent}% off</Badge>
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
    </Card>
  )
}
