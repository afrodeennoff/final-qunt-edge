import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import RollingAdBanner from '../../(home)/components/RollingAdBanner'
import { CONTENT_PADDING, MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
  showRollingBanner?: boolean
  topSpacingClassName?: string
  contentSpacingClassName?: string
  shellVariant?: 'accent' | 'black'
}>

const MiniMaxNavbarWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="w-full bg-background">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName,
  className,
  showRollingBanner = true,
  topSpacingClassName = 'pt-14 sm:pt-16 lg:pt-20',
  contentSpacingClassName = 'space-y-5 pb-16 pt-4 sm:space-y-6 sm:pt-5 lg:pt-6',
  shellVariant = 'black',
}: MarketingLayoutShellProps) {
  return (
    <div
      className={cn(
        'marketing-shell qe-v2-app-shell min-h-screen w-full overflow-x-hidden bg-black',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none fixed inset-0 hidden qe-v2-grid sm:block',
          shellVariant === 'black' ? 'opacity-[0.03]' : 'opacity-[0.05]',
        )}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_top,hsl(var(--primary)/0.09),transparent_36%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-[oklch(0.65_0.22_260_/_0.045)] via-[oklch(0.65_0.22_260_/_0.018)] to-transparent" />
      <div className="flex min-h-screen w-full">
        <div className="flex-1 min-h-0 min-w-0 bg-transparent">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className={cn('relative z-10 min-w-0', topSpacingClassName)}>
            {showRollingBanner ? (
              <Suspense fallback={null}>
                <RollingAdBanner />
              </Suspense>
            ) : null}
            <div
              className={cn(
                'relative min-w-0',
                CONTENT_PADDING,
                'mx-auto w-full',
                MARKETING_SHELL_WIDTH,
                contentSpacingClassName,
                contentClassName,
              )}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-white/5 to-transparent xl:block" />
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/5 to-transparent xl:block" />
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
