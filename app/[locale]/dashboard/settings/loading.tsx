import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Settings"
      title="Loading workspace preferences"
      description="Preparing profile, app, and dashboard configuration controls."
      fullScreen={false}
      compact
    />
  )
}
