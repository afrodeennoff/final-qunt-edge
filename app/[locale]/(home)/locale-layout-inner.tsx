'use client'

import { useReducedMotion } from 'motion/react'
import ErrorBoundary from '@/components/ui/error-boundary'
import MarketingLayoutShell from '@/app/[locale]/(landing)/components/marketing-layout-shell'
import { PublicRootProviders } from '@/components/providers/root-providers'
import { FloatingOrbs } from '@/components/animation/enhanced-motion'

export default function LocaleLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion()

  return (
    <ErrorBoundary>
      <PublicRootProviders>
        <div className="relative">
          {!reduceMotion && <FloatingOrbs className="z-0" />}
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
        </div>
      </PublicRootProviders>
    </ErrorBoundary>
  )
}
