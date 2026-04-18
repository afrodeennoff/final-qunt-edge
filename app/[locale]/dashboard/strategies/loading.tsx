import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Strategies"
      title="Loading playbooks"
      description="Bringing setup definitions, edge notes, and execution guidance into view."
      fullScreen={false}
      compact
    />
  )
}
