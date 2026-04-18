import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Admin"
      title="Loading newsletter builder"
      description="Preparing the newsletter template and content editor."
      fullScreen={false}
    />
  )
}
