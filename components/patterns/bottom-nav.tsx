import { cn } from './utils'
import { LucideIcon } from 'lucide-react'

interface BottomNavProps {
  items: {
    name: string
    icon: LucideIcon
  }[]
  activeIndex: number
  onNavigate?: (index: number) => void
  className?: string
}

export function BottomNav({
  items,
  activeIndex,
  onNavigate,
  className,
}: BottomNavProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-card border-t border-border',
        className
      )}
      data-slot="bottom-nav"
    >
      <div className={cn('pb-safe', 'flex justify-around items-center')}>
        {items.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1 py-2 px-3 cursor-pointer"
              onClick={() => onNavigate?.(index)}
            >
              <item.icon
                className={cn('size-5', isActive ? 'text-primary' : 'text-muted-foreground/60')}
              />
              <span
                className={cn('text-[10px]', isActive ? 'text-primary' : 'text-muted-foreground/60')}
              >
                {item.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}