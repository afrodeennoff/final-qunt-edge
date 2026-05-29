import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
 as?: React.ElementType
}

function Skeleton({
  className,
  as: Component = 'div',
  ...props
}: SkeletonProps) {
  return (
  <Component
  className={cn(
  "skeleton-pulse rounded-xl border border-border/10 bg-gradient-to-br from-muted/50 to-muted/20 ring-1 ring-inset ring-white/[0.02]",
  className
  )}
  {...props}
  />
  )
}

export function DashboardHeaderSkeleton() {
 return (
 <div className="mb-6 gap-3">
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <Skeleton className="h-7 w-48" />
 <Skeleton className="h-4 w-32" />
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-9 w-24" />
 <Skeleton className="h-9 w-24" />
 </div>
 </div>
 <div className="flex gap-2">
 <Skeleton className="h-8 w-20" />
 <Skeleton className="h-8 w-20" />
 <Skeleton className="h-8 w-20" />
 <Skeleton className="h-8 w-20" />
 </div>
 </div>
 )
}

export function WidgetGridSkeleton() {
 return (
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
 {Array.from({ length: 8 }).map((_, i) => (
 <Skeleton key={i} className="h-32 w-full rounded-xl" />
 ))}
 </div>
 )
}

export function TableSkeleton() {
 return (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <Skeleton className="h-10 w-64" />
 <Skeleton className="h-10 w-32" />
 </div>
 <div className="space-y-2">
 {Array.from({ length: 10 }).map((_, i) => (
 <Skeleton key={i} className="h-12 w-full rounded-lg" />
 ))}
 </div>
 </div>
 )
}

export function AccountsSkeleton() {
 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 <Skeleton className="h-24 w-full rounded-xl" />
 <Skeleton className="h-24 w-full rounded-xl" />
 <Skeleton className="h-24 w-full rounded-xl" />
 </div>
 <div className="space-y-2">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} className="h-16 w-full rounded-xl" />
 ))}
 </div>
 </div>
 )
}

export { Skeleton }

// For backward compatibility: SkeletonV2 is an alias
export { Skeleton as SkeletonV2 }

export { SpinnerV2 as Spinner }

export function SpinnerV2({ size = 24, className }: { size?: number; className?: string }) {
 return (
 <svg
 width={size}
 height={size}
 viewBox="0 0 50 50"
 className={cn("animate-spin", className)}
 >
 <circle
 cx="25" cy="25" r="20"
 strokeWidth="4"
 fill="none"
 stroke="currentColor"
 strokeLinecap="round"
 strokeDasharray="80, 200"
 />
 </svg>
 )
}
