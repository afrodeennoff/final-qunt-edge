import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function HomeLoading() {
  return (
    <RouteLoadingScreen
      eyebrow="Home"
      title="Composing the home surface"
      description="Bringing the hero, proof, and navigation layers into view."
      fullScreen={false}
    />
  )
}
