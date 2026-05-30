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
    <div className="relative w-full max-w-full overflow-hidden rounded-[14px] bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-0 shadow-sm">
      <div className="absolute inset-0 rounded-[14px] ring-1 ring-inset ring-primary/[0.03]" />
      <div className="w-full max-w-full overflow-hidden" style={edgeFadeMask}>
        <div className="flex min-w-max animate-scroll whitespace-nowrap py-2.5">
          {repeatedItems.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={`/${currentLocale === 'en' ? '' : currentLocale}/firm/${item.firmSlug}`}
              className={cn(
                'inline-flex items-center gap-2.5 px-5 text-[0.8rem] font-medium tracking-wide transition-all duration-300 hover:opacity-80',
              )}
            >
              {item.type === 'deal' ? (
                <Tag className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-muted-foreground/60" />
              )}
              <span className="text-foreground/80">{item.firmName}</span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]',
                  item.type === 'deal'
                    ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20'
                    : 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
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
