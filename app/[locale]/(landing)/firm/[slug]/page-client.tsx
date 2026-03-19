"use client"
import React from 'react'
import { FirmReviewsSection } from './components/firm-reviews-section'
import { FirmCouponsSection } from './components/firm-coupons-section'

export function FirmDetailClient({ firm }: { firm: any }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <FirmHeader firm={firm} />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <section>
            <h3 className="text-lg font-semibold mb-2">Challenges</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div><strong>Payout Model</strong></div><div>{firm?.payoutModel ?? '-'}</div>
              <div><strong>Drawdown Type</strong></div><div>{firm?.drawdownType ?? '-'}</div>
              <div><strong>Profit Split</strong></div><div>{firm?.profitSplit ?? '-'}</div>
              <div><strong>Max Allocation</strong></div><div>{firm?.maxAllocation ?? '-'}</div>
            </div>
          </section>
          <section className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Rules</h3>
            <table className="min-w-full text-sm text-muted-foreground">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Drawdown Type</th>
                  <th className="px-2 py-1 text-left">Profit Split</th>
                  <th className="px-2 py-1 text-left">Payout Model</th>
                  <th className="px-2 py-1 text-left">Platform</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{firm?.drawdownType ?? '-'}</td>
                  <td className="px-2 py-1">{firm?.profitSplit ?? '-'}</td>
                  <td className="px-2 py-1">{firm?.payoutModel ?? '-'}</td>
                  <td className="px-2 py-1">{firm?.platform ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        <div>
          <FirmReviewsSection firmId={firm?.id} />
        </div>
      </div>
      <FirmCouponsSection firmId={firm?.id} />
    </div>
  )
}

function FirmHeader({ firm }: { firm: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
        <FirmIconPlaceholder />
      </div>
      <div>
        <div className="text-xl font-bold">{firm?.name}</div>
        <div className="text-sm text-muted-foreground">{firm?.category}</div>
      </div>
    </div>
  )
}


function FirmIconPlaceholder() {
  return (
    <span className="w-6 h-6 rounded-full bg-gray-400" aria-label="logo" />
  )
}

 
