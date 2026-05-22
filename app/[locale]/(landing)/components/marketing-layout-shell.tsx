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
  return <div className="w-full border-b border-border bg-muted/20">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1380px]',
  className,
  showRollingBanner = true,
  topSpacingClassName = 'pt-16 sm:pt-20 lg:pt-24',
  contentSpacingClassName = 'space-y-6 pb-16 pt-4 sm:pt-6 lg:pt-8',
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
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-border/30" />
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
