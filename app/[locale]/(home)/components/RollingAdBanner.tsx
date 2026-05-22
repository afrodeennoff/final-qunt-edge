"use client"

import Link from 'next/link'
import { Building2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listPropFirmBannerItems } from '@/server/prop-firms'
import { useCurrentLocale } from '@/locales/client'
import { useEffect, useState } from 'react'
import type { PropFirmBannerItem } from '@/server/prop-firms'

const edgeFadeMask = {
  maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
}

export default function RollingAdBanner() {
  const currentLocale = useCurrentLocale()
  const [items, setItems] = useState<PropFirmBannerItem[]>([])

  useEffect(() => {
    async function loadData() {
      const data = await listPropFirmBannerItems()
      setItems(data)
    }
    loadData()
  }, [])

  if (items.length === 0) {
    return null
  }

  const repeatedItems = [...items, ...items, ...items]

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-xl bg-muted/20">
      <div className="w-full max-w-full overflow-hidden" style={edgeFadeMask}>
        <div className="flex min-w-max animate-scroll whitespace-nowrap py-2">
          {repeatedItems.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={`/${currentLocale === 'en' ? '' : currentLocale}/firm/${item.firmSlug}`}
              className={cn(
                'inline-flex items-center gap-2.5 px-4 text-[0.8rem] font-medium tracking-wide transition-opacity duration-300 hover:opacity-80',
              )}
            >
              {item.type === 'deal' ? (
                <Tag className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-foreground">{item.firmName}</span>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide',
                  item.type === 'deal' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success',
                )}
              >
                {item.badge}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
