"use client"
import React, { useState, useEffect } from 'react'
import { listFirmCoupons } from '@/server/firm-coupons'

export function FirmCouponsSection({ firmId }: { firmId: string }) {
  const [coupons, setCoupons] = useState<any[]>([])

  useEffect(() => {
    if (!firmId) return
    listFirmCoupons(firmId).then(setCoupons).catch(() => setCoupons([]))
  }, [firmId])

  if (coupons.length === 0) {
    return (
      <section className="border rounded p-4 mt-4">
        <div className="text-sm font-semibold mb-2">Coupons</div>
        <div className="text-sm text-muted-foreground">No coupons available.</div>
      </section>
    )
  }

  return (
    <section className="border rounded p-4 mt-4">
      <div className="text-sm font-semibold mb-3">Coupons</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="border rounded p-3 bg-v2-bg-elevated">
            <div className="font-mono text-sm font-bold text-v2-accent">{coupon.code}</div>
            <div className="text-sm text-v2-text-secondary mt-1">
              {coupon.discountPercent}% off
              {coupon.challengeFee && ` — $${coupon.challengeFee}`}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
