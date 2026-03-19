"use client"
import React from 'react'
import Link from 'next/link'
import { CardV2, ButtonV2, BadgeV2, InputV2 } from '@/components/ui/v2'
import { FirmIcon, DealsIcon } from '@/components/icons/svg-icons'
import { DealsSidebarV2 } from './deals-sidebar'

type FirmCard = {
  id: string
  slug: string
  name: string
  category: string
  shortDesc?: string
  logoUrl?: string
  _count?: { reviews?: number; coupons?: number }
}

export function DealsV2Experience({ initialFirms }: { initialFirms: FirmCard[] }) {
  const [query, setQuery] = React.useState('')

  const filteredFirms = React.useMemo(() => {
    if (!query) return initialFirms
    return initialFirms.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [initialFirms, query])

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="border-b border-v2-border bg-v2-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-v2-lg bg-v2-accent-subtle">
                <DealsIcon size={20} className="text-v2-accent" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-v2-text-primary">Prop Firm Deals</h1>
                <p className="text-xs text-v2-text-secondary">Find the best evaluation deals</p>
              </div>
            </div>
            <div className="w-64">
              <InputV2
                placeholder="Search firms..."
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-v2-text-secondary">
                {filteredFirms.length} firm{filteredFirms.length !== 1 ? 's' : ''} found
              </h2>
              <div className="flex gap-2">
                <BadgeV2 variant="default">{initialFirms.filter(f => f.category === 'Futures').length} Futures</BadgeV2>
                <BadgeV2 variant="default">{initialFirms.filter(f => f.category === 'Forex').length} Forex</BadgeV2>
              </div>
            </div>
            <div className="space-y-3">
              {filteredFirms.map((f) => (
                <FirmCardV2 key={f.id} firm={f} />
              ))}
              {filteredFirms.length === 0 && (
                <CardV2 className="p-8 text-center">
                  <p className="text-v2-text-secondary">No firms found matching &ldquo;{query}&rdquo;</p>
                </CardV2>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <DealsSidebarV2 firms={initialFirms} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const FirmCardV2 = React.memo(function FirmCardV2({ firm }: { firm: FirmCard }) {
  return (
    <CardV2 className="group p-4 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-v2-lg bg-v2-accent-subtle">
        <FirmIcon size={24} className="text-v2-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-v2-text-primary truncate">{firm.name}</span>
          <BadgeV2 variant={firm.category === 'Futures' ? 'default' : 'accent'}>{firm.category}</BadgeV2>
        </div>
        <p className="text-xs text-v2-text-secondary line-clamp-2">{firm.shortDesc ?? 'Prop trading firm'}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-v2-text-tertiary">{firm._count?.reviews ?? 0} reviews</span>
          <span className="text-xs text-v2-text-tertiary">{firm._count?.coupons ?? 0} coupons</span>
        </div>
      </div>
      <div className="shrink-0">
        <Link href={`/firm/${firm.slug}`}>
          <ButtonV2 variant="outline" size="sm">View Details</ButtonV2>
        </Link>
      </div>
    </CardV2>
  )
})
FirmCardV2.displayName = 'FirmCardV2'

export default DealsV2Experience
