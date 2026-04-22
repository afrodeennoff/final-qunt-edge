import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Team"
      title="Loading trader profile"
      description="Fetching member performance data and analytics."
      fullScreen={false}
    />
  )
}
