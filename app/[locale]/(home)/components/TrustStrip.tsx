import { Shield, Lock, ShieldCheck } from 'lucide-react'

const brokers = [
  'Tradovate',
  'Rithmic',
  'IBKR',
  'CQG',
  'NINJA|TRADER',
]

export default function TrustStrip() {
  return (
    <section className="border-y border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Security Badges */}
          <div className="flex flex-wrap items-center gap-6">
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
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mr-2">
              Integrations
            </span>
            {brokers.map((broker) => (
              <span
                key={broker}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {broker}
              </span>
            ))}
          </div>

          {/* Social Proof */}
          <p className="text-muted-foreground">
            Trusted by{' '}
            <span className="text-foreground font-medium">
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
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
