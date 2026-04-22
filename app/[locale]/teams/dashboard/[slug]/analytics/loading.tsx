import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Team"
      title="Loading team analytics"
      description="Compiling shared performance data and team benchmarks."
      fullScreen={false}
    />
  )
}
