import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyNotificationProps {
  show: boolean
  message: string
}

export function CopyNotification({ show, message }: CopyNotificationProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-background/70 transition-opacity duration-200',
      show ? 'opacity-100' : 'opacity-0 pointer-events-none'
    )}>
      <div className={cn(
        'bg-popover/90 text-foreground/95 px-6 py-4 rounded-xl shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.08),0_16px_48px_-16px_rgba(0,0,0,0.5)] transform transition-all duration-200 flex flex-col items-center gap-2',
        show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      )}>
        <div className="bg-accent/70 rounded-full p-2">
          <Check className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
} 