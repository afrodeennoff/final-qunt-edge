import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Billing"
      title="Loading billing workspace"
      description="Preparing plan details, usage context, and account actions."
      fullScreen={false}
      compact
    />
  )
}
