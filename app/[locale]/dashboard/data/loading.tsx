import { RouteLoadingScreen } from '@/components/ui/route-state'

export default function Loading() {
  return (
    <RouteLoadingScreen
      eyebrow="Data"
      title="Loading data settings"
      description="Bringing data sources, account context, and sync details into view."
      fullScreen={false}
      compact
    />
  )
}
