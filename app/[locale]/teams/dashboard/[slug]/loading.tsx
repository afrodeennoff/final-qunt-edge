import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Team"
      title="Loading team dashboard"
      description="Fetching team overview, activity, and shared metrics."
      fullScreen={false}
    />
  )
}
