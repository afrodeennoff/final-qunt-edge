import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function WidgetSkeleton() {
  return (
    <Card variant="default" className="h-full">
      <CardHeader className="pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-background/30" />
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="h-8 w-full animate-pulse rounded bg-primary/[0.05]" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-primary/[0.05]" />
      </CardContent>
    </Card>
  )
}
