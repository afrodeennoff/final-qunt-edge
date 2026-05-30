import { cn } from './utils'
import { LucideIcon } from 'lucide-react'

interface BriefingCarouselProps {
  title?: string
  items: {
    icon: LucideIcon
    badge: string
    badgeColor: string
    title: string
    description: string
  }[]
  className?: string
}

export function BriefingCarousel({
  title,
  items,
  className,
}: BriefingCarouselProps) {
  return (
    <div className={cn('w-full', className)} data-slot="briefing-carousel">
      {title && (
        <h3 className="text-[18px] font-black text-foreground mb-4 px-6">
          {title}
        </h3>
      )}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="w-[280px] flex-shrink-0 rounded-2xl p-6 bg-card shadow-card snap-start border border-transparent"
          >
            <div
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3',
                item.badgeColor === '#C85A54' ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              <item.icon
                className="size-3.5"
                strokeWidth={2}
              />
              {item.badge}
            </div>
            <p className="text-[15px] font-bold text-foreground leading-tight mb-2">
              {item.title}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}