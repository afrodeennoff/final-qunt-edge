import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Admin"
      title="Loading editor"
      description="Preparing the blog post editor and draft content."
      fullScreen={false}
    />
  )
}
