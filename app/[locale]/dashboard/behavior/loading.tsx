import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Behavior"
      title="Loading behavior review"
      description="Preparing journaling, reflection, and coaching signals."
      fullScreen={false}
      compact
    />
  )
}
