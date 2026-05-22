import ErrorBoundary from '@/components/ui/error-boundary'
import MarketingLayoutShell from '../(landing)/components/marketing-layout-shell'
import { PublicRootProviders } from '@/components/providers/root-providers'

export default function LocaleLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <PublicRootProviders>
        <MarketingLayoutShell
          className="home-borderless-shell dark"
          contentClassName="w-full"
          showRollingBanner={true}
          topSpacingClassName=""
          contentSpacingClassName="pb-safe"
          shellVariant="black"
        >
          <div className="pb-safe">
            {children}
          </div>
        </MarketingLayoutShell>
      </PublicRootProviders>
    </ErrorBoundary>
  )
}
