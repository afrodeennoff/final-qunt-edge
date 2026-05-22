import { ShieldCheck, Sparkles, Users } from 'lucide-react'
import PricingPlans from '@/components/pricing-plans'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import {
  unifiedChipClassName,
  unifiedHeroPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

export function PricingPageClient() {
  return (
    <UnifiedPageShell widthClassName="max-w-[1320px]" className="py-12 sm:py-16">
      <div className="space-y-6">
        <section
          className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-5 sm:p-8 lg:p-10')}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_260px_at_12%_6%,rgba(255,255,255,0.07),transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(540px_220px_at_88%_6%,rgba(255,255,255,0.045),transparent_74%)]" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)] xl:items-end">
            <header className="space-y-4 lg:space-y-5">
              <span className={unifiedChipClassName}>
                <Sparkles className="h-3.5 w-3.5" />
                Pricing plans
              </span>

              <h1 className="max-w-4xl text-[clamp(2.2rem,5vw,4.3rem)] font-medium leading-[0.98] tracking-[-0.035em] text-foreground">
                Pick a plan that matches your execution cadence.
              </h1>

              <p className="max-w-3xl text-sm leading-[1.6] text-muted-foreground sm:text-base">
                Start with the essentials, then unlock deeper AI debriefs and behavior analytics as
                your workflow matures.
              </p>
            </header>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <PricingMetaChip
                icon={ShieldCheck}
                label="No lock-in"
                value="Monthly flexibility"
                className="animate-scale-reveal animate-scale-reveal-d1"
              />
              <PricingMetaChip
                icon={Users}
                label="Teams ready"
                value="Shared coaching flows"
                className="animate-scale-reveal animate-scale-reveal-d2"
              />
              <PricingMetaChip
                icon={Sparkles}
                label="AI included"
                value="Debriefs and pattern review"
                className="animate-scale-reveal animate-scale-reveal-d3"
              />
            </div>
          </div>
        </section>

        <section
          className={cn(
            unifiedSectionPanelClassName,
            'animate-fade-up-smooth animate-fade-up-smooth-d2 p-4 sm:p-6 lg:p-8',
          )}
        >
          <PricingPlans />
        </section>
      </div>
    </UnifiedPageShell>
  )
}

function PricingMetaChip({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[oklch(0.65_0.22_260/0.10)] bg-[oklch(0.65_0.22_260/0.02)] px-4 py-3 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
