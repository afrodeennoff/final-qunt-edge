import { Shield, Lock, ShieldCheck } from 'lucide-react'

const brokers = [
  'Tradovate',
  'Rithmic',
  'IBKR',
  'CQG',
  'NinjaTrader',
]

export default function TrustStrip() {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Security Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <TrustBadge
              icon={Shield}
              label="SOC2 Certified"
            />
            <TrustBadge
              icon={Lock}
              label="256-bit Encryption"
            />
            <TrustBadge
              icon={ShieldCheck}
              label="GDPR Compliant"
            />
          </div>

          {/* Integrations */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <span className="text-[0.7rem] text-muted-foreground/70 uppercase tracking-[0.14em] font-medium mr-1">
              Integrations
            </span>
            {brokers.map((broker) => (
              <span
                key={broker}
                className="text-[0.85rem] text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
              >
                {broker}
              </span>
            ))}
          </div>

          {/* Social Proof */}
          <p className="text-muted-foreground/80 text-[0.9rem]">
            Trusted by{' '}
            <span className="text-foreground font-semibold">
              50,000+
            </span>{' '}
            traders
          </p>
        </div>
      </div>
    </section>
  )
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg border border-border/50 bg-card/60 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-[0.85rem] text-muted-foreground">{label}</span>
    </div>
  )
}
