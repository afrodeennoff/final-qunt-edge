"use client"
import React from 'react'
import { CardV2, InputV2 } from '@/components/ui/v2'
import { LeaderboardIcon } from '@/components/icons/svg-icons'

type FirmCard = {
  id: string
  slug: string
  name: string
  category: string
  shortDesc?: string
  logoUrl?: string
  _count?: { reviews?: number }
}

export function DealsSidebarV2({ firms }: { firms: FirmCard[] }) {
  const rankedFirms = firms
    .filter(f => f._count?.reviews && f._count.reviews > 0)
    .sort((a, b) => (b._count?.reviews ?? 0) - (a._count?.reviews ?? 0))
    .slice(0, 5)

  return (
    <CardV2 className="p-4 space-y-3">
      <div className="flex items-center gap-2"><LeaderboardIcon /><span className="font-semibold">Top Firms</span></div>
      <div className="flex flex-col gap-2">
        {rankedFirms.length > 0 ? rankedFirms.map((firm, i) => (
          <div key={firm.id} className="flex items-center gap-3 p-3 rounded-lg bg-v2-bg-elevated">
            <span className="text-v2-text-tertiary text-xs font-medium">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-v2-text-primary truncate">{firm.name}</div>
              <div className="text-xs text-v2-text-secondary">{firm._count?.reviews ?? 0} reviews</div>
            </div>
          </div>
        )) : (
          <div className="text-sm text-muted-foreground py-4 text-center">No reviews yet</div>
        )}
      </div>
      <InputV2 placeholder="Search deals" value={""} onChange={()=>{}} />
    </CardV2>
  )
}
