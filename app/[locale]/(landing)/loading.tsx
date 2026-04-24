import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function LandingLoading() {
  return (
    <RouteLoadingScreen
      eyebrow="Loading"
      title="Preparing the page"
      description="Loading content and workspace shell."
      fullScreen={false}
    />
  )
}
