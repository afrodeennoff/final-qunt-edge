import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import RollingAdBanner from '../../(home)/components/RollingAdBanner'
 

 

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
}>

 
const MiniMaxNavbarWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="w-full bg-white">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1320px]',
  className,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn('marketing-shell min-h-screen w-full overflow-x-hidden', className)}>
      <div className="pointer-events-none fixed inset-0 hidden marketing-grid opacity-[0.18] sm:block" />
      <div className="flex min-h-screen w-full">
        {/* Full-width content: no sidebar column */}
        <div className="flex-1 min-h-0 bg-white">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24">
            <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
              <RollingAdBanner />
            </div>
            <div className={cn('pt-4 sm:pt-5', contentClassName)}>
              <MotionStagger>
                <MotionStaggerItem>{children}</MotionStaggerItem>
              </MotionStagger>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
