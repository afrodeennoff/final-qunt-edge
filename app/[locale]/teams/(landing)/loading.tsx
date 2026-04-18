import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Teams"
      title="Loading team overview"
      description="Preparing the public collaboration surface."
      fullScreen={false}
      compact
    />
  )
}
