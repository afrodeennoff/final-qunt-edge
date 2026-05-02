import MarketingLayoutShell from '../(landing)/components/marketing-layout-shell'
import { PublicRootProviders } from '@/components/providers/root-providers'

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <MarketingLayoutShell
      className="home-borderless-shell dark"
      contentClassName="w-full flex-1"
      showRollingBanner={false}
      topSpacingClassName=""
      contentSpacingClassName="pb-safe"
      shellVariant="black"
      fullWidth
      showSidebar={false}
    >
      <PublicRootProviders>{children}</PublicRootProviders>
    </MarketingLayoutShell>
  )
}
