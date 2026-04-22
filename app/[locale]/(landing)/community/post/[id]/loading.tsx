import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Community"
      title="Loading post"
      description="Fetching the post content, comments, and reactions."
      fullScreen={false}
    />
  )
}
