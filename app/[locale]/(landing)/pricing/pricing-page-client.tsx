import { ShieldCheck, Sparkles, Users } from 'lucide-react'
import PricingPlans from '@/components/pricing-plans'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

export function PricingPageClient() {
  return (
    <UnifiedPageShell widthClassName="max-w-[1320px]" className="py-12 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-[hsl(var(--mk-border)/0.4)] bg-[linear-gradient(160deg,hsl(var(--mk-surface)/0.92),hsl(var(--background)/0.7))] p-5 shadow-[0_36px_80px_-62px_hsl(var(--foreground)/0.95)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_260px_at_12%_6%,hsl(var(--primary)/0.18),transparent_72%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(540px_220px_at_88%_6%,hsl(var(--accent)/0.16),transparent_74%)]" />

        <header className="relative mb-8 space-y-4 lg:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing Plans
          </span>

          <h1 className="max-w-4xl text-[clamp(2.2rem,5vw,4.3rem)] font-medium leading-[0.98] tracking-[-0.035em] text-foreground">
            Pick a plan that matches your execution cadence.
          </h1>

          <p className="max-w-3xl text-sm leading-[1.55] text-muted-foreground sm:text-base">
            Start with the essentials, then unlock deeper AI debriefs and behavior analytics
            as your workflow matures.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <PricingMetaChip
              icon={ShieldCheck}
              label="No lock-in"
              value="Monthly flexibility"
            />
            <PricingMetaChip
              icon={Users}
              label="Teams ready"
              value="Shared coaching flows"
            />
            <PricingMetaChip
              icon={Sparkles}
              label="AI included"
              value="Debriefs and pattern review"
            />
          </div>
        </header>

        <div className="relative">
          <PricingPlans />
        </div>
      </section>
    </UnifiedPageShell>
  )
}

function PricingMetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--mk-border)/0.36)] bg-[hsl(var(--mk-surface-muted)/0.78)] px-4 py-3">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
