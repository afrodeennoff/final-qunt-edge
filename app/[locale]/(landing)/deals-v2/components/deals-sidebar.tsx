"use client"
import React from 'react'
import Link from 'next/link'
import { CardV2, InputV2 } from '@/components/ui/v2'
import { LeaderboardIcon, FirmIcon } from '@/components/icons/svg-icons'
import { cn } from '@/lib/utils'

type FirmCard = {
  id: string
  slug: string
  name: string
  category: string
  shortDesc?: string
  logoUrl?: string
  _count?: { reviews?: number; coupons?: number }
}

export function DealsSidebarV2({ firms }: { firms: FirmCard[] }) {
  const [search, setSearch] = React.useState('')

  const topFirms = React.useMemo(() => {
    return [...firms]
      .sort((a, b) => {
        const scoreA = (a._count?.reviews ?? 0) * 2 + (a._count?.coupons ?? 0)
        const scoreB = (b._count?.reviews ?? 0) * 2 + (b._count?.coupons ?? 0)
        return scoreB - scoreA
      })
      .slice(0, 5)
  }, [firms])

  const filteredFirms = React.useMemo(() => {
    if (!search) return []
    return firms.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
  }, [firms, search])

  return (
    <div className="space-y-4">
      <CardV2 className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <LeaderboardIcon size={18} className="text-v2-accent" />
          <span className="font-semibold text-v2-text-primary">Top Firms</span>
        </div>
        {topFirms.map((firm, i) => (
          <Link key={firm.id} href={`/firm/${firm.slug}`} className="block">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-v2-md transition-colors hover:bg-v2-bg-hover",
              i === 0 ? "bg-v2-accent-subtle border border-v2-accent/30" : "bg-v2-bg-elevated"
            )}>
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                i === 0 ? "bg-v2-accent text-white" : "bg-v2-bg-hover text-v2-text-secondary"
              )}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-v2-text-primary truncate">{firm.name}</div>
                <div className="flex gap-2 text-xs text-v2-text-secondary">
                  <span>{firm._count?.reviews ?? 0} reviews</span>
                  <span>{firm._count?.coupons ?? 0} coupons</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardV2>

      <CardV2 className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FirmIcon size={16} className="text-v2-text-secondary" />
          <span className="text-sm font-medium text-v2-text-primary">Quick Search</span>
        </div>
        <InputV2
          placeholder="Search firms..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        {filteredFirms.length > 0 && (
          <div className="mt-3 space-y-1">
            {filteredFirms.map(f => (
              <Link key={f.id} href={`/firm/${f.slug}`} className="block">
                <div className="text-sm text-v2-text-secondary py-2 px-2 rounded hover:bg-v2-bg-hover transition-colors">
                  {f.name}
                  <span className="text-xs text-v2-text-tertiary ml-2">{f.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardV2>
    </div>
  )
}
