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
  fullWidth?: boolean
  showSidebar?: boolean
}>

const MiniMaxNavbarWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="w-full border-b border-[oklch(0.65_0.22_260_/_0.05)] bg-background">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1380px]',
  className,
  showRollingBanner = true,
  topSpacingClassName = 'pt-16 sm:pt-20 lg:pt-24',
  contentSpacingClassName = 'space-y-8 pb-24 pt-6 sm:pt-8 lg:pt-10',
  shellVariant = 'black',
  fullWidth = false,
  showSidebar: _showSidebar = true,
}: MarketingLayoutShellProps) {
  return (
    <div
      className={cn(
        'marketing-shell qe-v2-app-shell min-h-screen w-full overflow-x-hidden bg-background',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none fixed inset-0 hidden qe-v2-grid sm:block',
          shellVariant === 'black' ? 'opacity-[0.012]' : 'opacity-[0.02]',
        )}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_38%)]" />
      <div className="pointer-events-none fixed inset-x-8 top-0 z-0 h-40 rounded-b-2xl border border-border/30 bg-background/30" />
      <div className="flex min-h-screen w-full">
        {/* Full-width content: no sidebar column */}
        <div className="flex-1 min-h-0 min-w-0 bg-transparent">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className={cn('relative z-10 flex flex-1 flex-col min-w-0', topSpacingClassName)}>
            {showRollingBanner ? (
              <Suspense fallback={null}>
                <RollingAdBanner />
              </Suspense>
            ) : null}
            <div className={cn('min-w-0 px-2 sm:px-4', contentSpacingClassName, contentClassName)}>
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
