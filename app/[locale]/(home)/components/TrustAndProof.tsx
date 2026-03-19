import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Check } from 'lucide-react'

const trustPoints = [
  'Account-scoped reads and writes with ownership checks across imports, layouts, and uploads.',
  'Fail-closed budget enforcement and explicit error contracts that never silently fallback.',
  'Data portability: export review briefs and keep your performance loop portable.',
  'Ownership guards across imports, layouts, batch updates, and media deletion paths.',
  'Clear error envelopes so clients handle failures predictably, not unexpectedly.',
  'Budget and routing guardrails that fail closed when dependencies are unavailable.',
]

const quote = {
  text: 'The review cadence finally made my discipline measurable instead of subjective.',
  attribution: 'Funded Futures Trader',
}

export default function TrustAndProof() {
  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <Badge variant="outline" className="border-[hsl(var(--primary)/0.34)] bg-[hsl(var(--primary)/0.08)] text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Trust Architecture
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.8vw,3.4rem)] font-semibold leading-[0.92] tracking-[-0.02em] [font-family:var(--home-display)]">
            Built like a trading system:
            <span className="block text-foreground">secure, observable, and review-ready</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
            Trust is not a slogan. It is enforced boundaries, predictable failure modes, and a review loop you can audit week after week.
          </p>
        </div>

        <div className="mb-12 text-center">
          <blockquote className="mx-auto max-w-3xl">
            <p className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-medium leading-snug tracking-[-0.01em] [font-family:var(--home-display)] text-foreground/95">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-4">
              <span className="text-sm uppercase tracking-[0.18em] text-foreground/60 [font-family:var(--home-copy)]">
                {quote.attribution}
              </span>
            </footer>
          </blockquote>
        </div>

        <div className="mb-8">
          <h3 className="mb-6 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/60 [font-family:var(--home-copy)]">
            What We Enforce
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-[hsl(var(--mk-border)/0.18)] bg-[hsl(var(--mk-surface)/0.02)] px-4 py-3"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--mk-surface-muted)/0.5)]">
                  <Check className="h-3 w-3 text-foreground/70" />
                </span>
                <span className="text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-foreground/60 [font-family:var(--home-copy)]">
          <ShieldCheck className="h-4 w-4 text-foreground/50" />
          <span className="text-center">
            Secure data boundaries, disciplined review loops, and production-grade reliability.
          </span>
        </div>
      </div>
    </section>
  )
}
