import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Admin"
      title="Loading operations studio"
      description="Preparing publishing, campaign, and review controls."
      fullScreen={false}
    />
  )
}
