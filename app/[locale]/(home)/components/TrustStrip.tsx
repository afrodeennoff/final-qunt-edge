'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, ShieldCheck } from 'lucide-react'

const badges = [
  { icon: Shield, label: 'SOC2 Certified' },
  { icon: Lock, label: '256-bit Encryption' },
  { icon: ShieldCheck, label: 'GDPR Compliant' },
]

const brokers = ['Tradovate', 'Rithmic', 'IBKR', 'CQG', 'NinjaTrader']

export default function TrustStrip() {
  return (
    <motion.section
      className="border-y border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1)/0.8)]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg border border-[hsl(var(--mk-border)/0.4)] bg-[hsl(var(--mk-surface)/0.6)] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[0.82rem] text-muted-foreground">{badge.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <span className="text-[0.68rem] text-muted-foreground/50 uppercase tracking-[0.14em] font-medium mr-1">
              Integrations
            </span>
            {brokers.map((broker) => (
              <span
                key={broker}
                className="text-[0.82rem] text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                {broker}
              </span>
            ))}
          </div>

          <p className="text-muted-foreground/70 text-[0.88rem]">
            Trusted by{' '}
            <span className="text-foreground font-semibold">
              50,000+
            </span>{' '}
            traders
          </p>
        </div>
      </div>
    </motion.section>
  )
}
