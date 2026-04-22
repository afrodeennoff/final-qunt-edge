import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Teams"
      title="Checking your invitation"
      description="Preparing join flow details and access context."
      fullScreen={false}
      compact
    />
  )
}
