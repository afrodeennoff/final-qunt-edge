import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Teams"
      title="Loading team controls"
      description="Bringing member settings and management actions into view."
      fullScreen={false}
      compact
    />
  )
}
