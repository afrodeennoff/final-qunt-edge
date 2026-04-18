import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Admin"
      title="Loading firm details"
      description="Fetching firm configuration, reviews, and coupon data."
      fullScreen={false}
    />
  )
}
