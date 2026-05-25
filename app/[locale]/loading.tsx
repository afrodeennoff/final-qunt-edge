import { Skeleton } from '@/components/ui/skeleton'

export default function LocaleLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 px-4">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="mx-auto h-3 w-3/4" />
          <Skeleton className="mx-auto h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}
