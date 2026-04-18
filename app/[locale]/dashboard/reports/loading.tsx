import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Reports"
      title="Loading analytics reports"
      description="Preparing deeper performance slices and reporting context."
      fullScreen={false}
      compact
    />
  )
}
