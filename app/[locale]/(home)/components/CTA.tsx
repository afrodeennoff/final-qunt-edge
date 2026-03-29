'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'

export default function CTA() {
  const locale = useCurrentLocale()
  return (
    <section className="relative bg-gradient-to-t from-card/20 to-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div className="marketing-panel mx-auto max-w-4xl rounded-2xl px-6 py-11 text-center sm:px-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/80 [font-family:var(--home-copy)]">Your Next Edge</p>
        <h2 className="mt-2 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.028em] [font-family:var(--home-display)]">
          Keep your strategy.
          <span className="block text-foreground">Raise the standard of your decisions.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.78] text-foreground/85 sm:text-base [font-family:var(--home-copy)]">
          Join in minutes and receive your first AI-backed performance audit before your next session opens.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/${locale}/authentication?next=dashboard`}
            className="inline-flex h-12 w-full max-w-[260px] items-center justify-center rounded-2xl bg-primary px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all duration-300 hover:bg-primary/90 sm:w-auto sm:min-w-[230px] sm:px-9 [font-family:var(--home-copy)]"
          >
            Start Free Audit
          </Link>
          <p className="text-xs text-foreground/80 [font-family:var(--home-copy)]">No credit card required. 7-day Pro trial unlocks advanced diagnostics.</p>
        </div>
      </div>
    </section>
  )
}
