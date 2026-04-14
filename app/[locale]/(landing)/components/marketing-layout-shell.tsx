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
 contentClassName = 'mx-auto w-full max-w-[1320px]',
 className,
 showRollingBanner = true,
 topSpacingClassName = 'pt-16 sm:pt-20 lg:pt-24',
 contentSpacingClassName = 'space-y-8 pb-24 pt-8 sm:pt-9',
 shellVariant = 'black',
}: MarketingLayoutShellProps) {
 return (
 <div
 className={cn('marketing-shell qe-v2-app-shell min-h-screen w-full overflow-x-hidden', className)}
 style={
 shellVariant === 'black'
 ? { background: 'linear-gradient(180deg, oklch(0 0 0) 0%, oklch(0.01 0 0) 100%)' }
 : undefined
 }
 >
 {shellVariant === 'accent' ? <BackgroundGlow variant="accent" /> : null}
 <div className={cn('pointer-events-none fixed inset-0 hidden qe-v2-grid sm:block', shellVariant === 'black' ? 'opacity-[0.08]' : 'opacity-[0.14]')} />
 {shellVariant === 'accent' ? (
 <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,oklch(0.80_0.12_82/0.14),transparent_36%),radial-gradient(circle_at_bottom_right,oklch(0.54_0.08_20/0.10),transparent_34%)]" />
 ) : null}
 <div className="flex min-h-screen w-full">
 {/* Full-width content: no sidebar column */}
 <div className="flex-1 min-h-0 bg-transparent">
 <MiniMaxNavbarWrapper>
 <Navbar />
 </MiniMaxNavbarWrapper>
 <div className={cn('relative z-10', topSpacingClassName)}>
 {showRollingBanner ? (
 <MotionSection className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8" delay={0.03}>
 <RollingAdBanner />
 </MotionSection>
 ) : null}
 <div className={cn(contentSpacingClassName, contentClassName)}>
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
