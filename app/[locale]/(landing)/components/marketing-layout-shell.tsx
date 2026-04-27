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
}>

const MiniMaxNavbarWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="w-full bg-background">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName,
  className,
  showRollingBanner = true,
  topSpacingClassName = 'pt-16 sm:pt-[4.5rem] lg:pt-[5.25rem]',
  contentSpacingClassName = 'space-y-6 pb-16 pt-5 sm:space-y-7 sm:pt-6 lg:space-y-8 lg:pt-7',
  shellVariant = 'black',
  fullWidth = false,
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
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1 flex-col min-h-0 min-w-0 bg-transparent">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className={cn('relative z-10 flex flex-1 flex-col min-w-0', topSpacingClassName)}>
            {showRollingBanner ? (
              <Suspense fallback={null}>
                <RollingAdBanner />
              </Suspense>
            ) : null}
            <div
              className={cn(
                'relative flex flex-1 flex-col min-w-0',
                !fullWidth && CONTENT_PADDING,
                'mx-auto w-full',
                !fullWidth && MARKETING_SHELL_WIDTH,
                contentSpacingClassName,
                contentClassName,
              )}
            >
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
