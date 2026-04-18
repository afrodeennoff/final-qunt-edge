import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Team"
      title="Loading trader directory"
      description="Fetching team member list and performance overview."
      fullScreen={false}
    />
  )
}
