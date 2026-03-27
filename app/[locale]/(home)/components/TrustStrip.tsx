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
    <section className="border-y border-[#1A1A21] bg-[#0b0b0d]">
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
            <span className="text-xs text-[#707070] uppercase tracking-wider mr-2">
              Integrations
            </span>
            {brokers.map((broker) => (
              <span
                key={broker}
                className="text-sm text-[#9E9E9E] hover:text-[#E0E0E0] transition-colors"
              >
                {broker}
              </span>
            ))}
          </div>

          {/* Social Proof */}
          <p className="text-[#9E9E9E]">
            Trusted by{' '}
            <span className="text-[#E0E0E0] font-medium">
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
      <div className="w-8 h-8 rounded-lg border border-[#1A1A21] bg-[#101014] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#2962FF]" />
      </div>
      <span className="text-sm text-[#9E9E9E]">{label}</span>
    </div>
  )
}
