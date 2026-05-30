import { cn } from './utils'

interface RankedListProps {
  title?: string
  items: {
    rank: number
    name: string
    value: string
    isHighlighted?: boolean
    badge?: string
  }[]
  footer?: string
  className?: string
}

export function RankedList({
  title,
  items,
  footer,
  className,
}: RankedListProps) {
  return (
    <div
      className={cn('rounded-2xl p-6 bg-card shadow-card', className)}
      data-slot="ranked-list"
    >
      {title && (
        <h3 className="text-[18px] font-black text-foreground mb-6">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              item.isHighlighted
                ? 'bg-primary/8 border border-primary/20'
                : 'bg-muted/50'
            )}
          >
            <div
              className={cn(
                'size-8 rounded-full flex items-center justify-center text-[12px] font-bold',
                item.isHighlighted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {item.rank}
            </div>
            <span
              className={cn(
                'flex-1 font-black',
                item.isHighlighted ? 'text-primary' : 'text-foreground'
              )}
            >
              {item.name}
            </span>
            <span className="font-bold whitespace-nowrap">{item.value}</span>
            {item.badge && (
              <span className="text-[11px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      {footer && (
        <div className="border-t border-transparent pt-4 mt-4 text-[12px] text-muted-foreground text-center">
          {footer}
        </div>
      )}
    </div>
  )
}