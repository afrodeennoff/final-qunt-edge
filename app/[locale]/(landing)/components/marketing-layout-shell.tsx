import Navbar from './navbar'
import Footer from './footer'
import { cn } from '@/lib/utils'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/motion-primitives'
import RollingAdBanner from '../../(home)/components/RollingAdBanner'
import { SidebarInset } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'

const LandingSidebar = dynamic(
  () => import('@/components/sidebar/landing-sidebar').then((m) => m.LandingSidebar),
  {
    loading: () => <div className="hidden md:block w-14 lg:w-[72px] shrink-0" />,
  }
)

type MarketingLayoutShellProps = Readonly<{
  children: React.ReactNode
  contentClassName?: string
  className?: string
  showSidebar?: boolean
}>

export default function MarketingLayoutShell({
  children,
  contentClassName = 'mx-auto w-full max-w-[1320px]',
  className,
  showSidebar = true,
}: MarketingLayoutShellProps) {
  return (
    <div className={cn('marketing-shell min-h-screen w-full overflow-x-hidden', className)}>
      <div className="pointer-events-none fixed inset-0 hidden marketing-grid opacity-[0.18] sm:block" />
      <div className="flex min-h-screen w-full">
        {showSidebar ? <LandingSidebar /> : null}
        <SidebarInset className="flex-1 min-h-0">
          <Navbar />
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
        </SidebarInset>
      </div>
    </div>
  )
}
