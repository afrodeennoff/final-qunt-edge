"use client"
import React from 'react'
import Link from 'next/link'
import { CardV2, ButtonV2, BadgeV2, AvatarV2 } from '@/components/ui/v2'
import { FirmIcon } from '@/components/icons/svg-icons'
import { DealsSidebarV2 } from './deals-sidebar'

type FirmCard = {
  id: string
  slug: string
  name: string
  category: string
  shortDesc?: string
  logoUrl?: string
  _count?: { reviews?: number }
}

export function DealsV2Experience({ initialFirms }: { initialFirms: FirmCard[] }) {
  const [query, setQuery] = React.useState('')
  
  const firms = initialFirms.filter((f) => !query || f.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <section className="space-y-4">
        {firms.map((f) => (
          <FirmCardV2 key={f.id} firm={f} />
        ))}
      </section>
      <aside className="space-y-4">
        <DealsSidebarV2 firms={initialFirms} />
      </aside>
    </div>
  )
}

const FirmCardV2 = React.memo(function FirmCardV2({ firm }: { firm: FirmCard }) {
  return (
    <CardV2 className="p-4 flex items-center gap-4">
      <AvatarV2 {...({} as any)} src={firm.logoUrl as any} alt={firm.name} size={"md" as any} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FirmIcon />
          <span className="text-sm font-semibold">{firm.name}</span>
          <BadgeV2>{firm.category}</BadgeV2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{firm.shortDesc ?? ''}</p>
      </div>
      <Link href={`/firm/${firm.slug}`} target="_blank" rel="noopener noreferrer">
        <ButtonV2 variant="outline">View Firm</ButtonV2>
      </Link>
    </CardV2>
  )
})

export default DealsV2Experience
