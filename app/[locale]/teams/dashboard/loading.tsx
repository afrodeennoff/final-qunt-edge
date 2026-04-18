import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Teams dashboard"
      title="Loading team command"
      description="Hydrating team summaries, members, and shared performance context."
      fullScreen={false}
    />
  )
}
