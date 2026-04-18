import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Team"
      title="Loading member management"
      description="Fetching member roster and invitation controls."
      fullScreen={false}
    />
  )
}
