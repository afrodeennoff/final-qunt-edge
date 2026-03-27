import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(41,98,255,0.2),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-[#E0E0E0]">
          Ready to{' '}
          <span className="text-[#2962FF]">trade smarter</span>
          ?
        </h2>
        <p className="text-xl text-[#9E9E9E] mb-8">
          Join 50,000+ traders who have improved their performance with Qunt Edge.
          Start your free audit today.
        </p>
        <ButtonV2 
          asChild
          size="lg"
          className="bg-[#2962FF] hover:bg-[#2962FF]/90 text-lg px-8 btn-primary-glow"
        >
          <Link href={`/${locale}/authentication?next=dashboard`}>
            Start Free Audit
          </Link>
        </ButtonV2>
        <p className="mt-4 text-sm text-[#707070]">
          No credit card required • Setup in 2 minutes
        </p>
      </div>
    </section>
  )
}
