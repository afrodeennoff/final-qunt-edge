import React from 'react'

import { prisma } from '@/lib/prisma'
import { CardV2, CardV2Title, CardV2Content } from '@/components/ui/v2'

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params

  // Fetch real trade stats for this trader
  const traderStats = await prisma.trade.aggregate({
    where: { userId: slug },
    _sum: { pnl: true },
    _count: { id: true },
  })

  const totalPnl = Number(traderStats._sum.pnl ?? 0)
  const totalTrades = traderStats._count.id

  const pnlColor = totalPnl > 0 ? 'text-green-500' : totalPnl < 0 ? 'text-red-500' : 'text-v2-text-secondary'
  const pnlPrefix = totalPnl > 0 ? '+' : ''

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/trader-avatar-placeholder.png" alt="avatar" className="w-12 h-12 rounded-full" />
          <div>
            <div className="text-xl font-semibold">Trader: {slug}</div>
            <div className="text-sm text-v2-text-secondary">Public profile</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CardV2>
            <CardV2Title>Total Trades</CardV2Title>
            <CardV2Content>{totalTrades}</CardV2Content>
          </CardV2>
          <CardV2>
            <CardV2Title>Total Profit</CardV2Title>
            <CardV2Content>
              <span className={pnlColor}>
                {pnlPrefix}${totalPnl.toLocaleString()}
              </span>
            </CardV2Content>
          </CardV2>
        </div>
      </div>
    </div>
  )
}
