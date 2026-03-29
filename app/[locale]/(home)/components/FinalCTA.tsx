import Link from 'next/link'
import { ButtonV2 as Button } from '@/components/ui/v2'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--primary)/0.12),transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.025em] mb-6 text-foreground leading-tight">
          Ready to{' '}
          <span className="text-gradient-primary">trade smarter</span>
          ?
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 mb-10 leading-relaxed">
          Join 50,000+ traders who have improved their performance with Qunt Edge.
          Start your free audit today.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 btn-primary-glow rounded-xl text-[1rem] px-8 h-13 font-medium shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_16px_40px_-12px_hsl(var(--primary)/0.7)] transition-shadow duration-300"
        >
          <Link href={`/${locale}/authentication?next=dashboard`}>
            Start Free Audit
          </Link>
        </Button>
        <p className="mt-5 text-[0.8rem] text-muted-foreground/60 tracking-wide">
          No credit card required · Setup in 2 minutes
        </p>
      </div>
    </section>
  )
}
