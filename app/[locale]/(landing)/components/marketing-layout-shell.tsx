import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'
import { MotionSection, MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import RollingAdBanner from '../../(home)/components/RollingAdBanner'
import { BackgroundGlow } from '@/components/ui/background-glow'
 

 

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
}>

 
const MiniMaxNavbarWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="w-full bg-background">{children}</div>
}

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1320px]',
  className,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn('marketing-shell qe-v2-app-shell min-h-screen w-full overflow-x-hidden', className)}>
      <BackgroundGlow variant="accent" />
      <div className="pointer-events-none fixed inset-0 hidden qe-v2-grid opacity-[0.14] sm:block" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,oklch(0.65_0.22_260/0.14),transparent_36%),radial-gradient(circle_at_bottom_right,oklch(0.82_0.185_155/0.07),transparent_34%)]" />
      <div className="flex min-h-screen w-full">
        {/* Full-width content: no sidebar column */}
        <div className="flex-1 min-h-0 bg-transparent">
          <MiniMaxNavbarWrapper>
            <Navbar />
          </MiniMaxNavbarWrapper>
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24">
            <MotionSection className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8" delay={0.03}>
              <RollingAdBanner />
            </MotionSection>
            <div className={cn('space-y-8 pb-24 pt-8 sm:pt-9', contentClassName)}>
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
