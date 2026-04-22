import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function AuthenticationLoading() {
  return (
    <RouteLoadingScreen
      eyebrow="Authentication"
      title="Loading secure access"
      description="Preparing sign-in, verification, and redirect context."
    />
  )
}
