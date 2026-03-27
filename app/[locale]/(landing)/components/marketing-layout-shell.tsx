import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'
import { MotionStagger, MotionStaggerItem } from '@/components/motion/motion-primitives'
import RollingAdBanner from '../../(home)/components/RollingAdBanner'

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
}>

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1320px]',
  className,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn('marketing-shell min-h-screen w-full overflow-x-hidden', className)}>
      <div className="pointer-events-none fixed inset-0 hidden marketing-grid opacity-[0.18] sm:block" />
      <Navbar />
      <RollingAdBanner />
      <div className={cn('relative z-10 pt-16 sm:pt-20 lg:pt-24', contentClassName)}>
        <MotionStagger>
          <MotionStaggerItem>{children}</MotionStaggerItem>
        </MotionStagger>
      </div>
      <Footer />
    </div>
  )
}
