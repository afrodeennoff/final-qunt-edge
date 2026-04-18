import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function DealsLoading() {
  return (
    <RouteLoadingScreen
      eyebrow="Deals"
      title="Loading partner offers"
      description="Gathering the latest firm perks and promotional details."
      fullScreen={false}
    />
  )
}
