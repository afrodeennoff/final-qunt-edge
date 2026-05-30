import ErrorBoundary from '@/components/ui/error-boundary'
import { PublicRootProviders } from '@/components/providers/root-providers'

// Clean layout for the new Velocity-style homepage (no old navbar/footer)
export default function LocaleLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <PublicRootProviders>
        <div className="min-h-dvh bg-[#0a0a0a] text-white">
          {children}
        </div>
      </PublicRootProviders>
    </ErrorBoundary>
  )
}
