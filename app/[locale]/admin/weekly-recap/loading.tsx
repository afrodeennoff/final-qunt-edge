import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Admin"
      title="Loading weekly recap"
      description="Compiling performance data and weekly summary."
      fullScreen={false}
    />
  )
}
