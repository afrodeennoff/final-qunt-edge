import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Import"
      title="Loading import center"
      description="Preparing broker connections, uploads, and sync controls."
      fullScreen={false}
      compact
    />
  )
}
