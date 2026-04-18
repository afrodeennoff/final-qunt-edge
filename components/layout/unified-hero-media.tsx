import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { unifiedHeroPanelClassName } from '@/components/layout/unified-page-recipes'

type UnifiedHeroMediaProps = {
  screenshot: ReactNode
  overlay?: ReactNode
  caption?: ReactNode
  className?: string
}

export function UnifiedHeroMedia({
  screenshot,
  overlay,
  caption,
  className,
}: UnifiedHeroMediaProps) {
  return (
    <div className={cn(unifiedHeroPanelClassName, 'relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-5 rounded-xl border border-primary/10" />
      <div className="relative z-10">{screenshot}</div>
      {overlay ? <div className="pointer-events-none absolute inset-0 z-20">{overlay}</div> : null}
      {caption ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30 sm:inset-x-5">
          {caption}
        </div>
      ) : null}
    </div>
  )
}
