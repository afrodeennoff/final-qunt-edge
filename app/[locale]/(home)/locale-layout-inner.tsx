import ErrorBoundary from '@/components/ui/error-boundary'
import MarketingLayoutShell from '@/app/[locale]/(landing)/components/marketing-layout-shell'
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
          contentClassName="w-full flex-1"
          showRollingBanner={false}
          topSpacingClassName=""
          contentSpacingClassName="pb-safe"
          shellVariant="black"
          fullWidth
          className="public-page"
        >
          {children}
        </MarketingLayoutShell>
      </PublicRootProviders>
    </ErrorBoundary>
  )
}
