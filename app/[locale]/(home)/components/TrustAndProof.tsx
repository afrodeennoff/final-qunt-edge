'use client'

import { ShieldCheck, Lock, FileCheck, Users } from 'lucide-react'
import { useTypedI18n } from '@/locales/client'

export default function TrustAndProof() {
  const t = useTypedI18n()

  const badges = [
    { icon: ShieldCheck, label: t('landing.trust.soc2') },
    { icon: Lock, label: t('landing.trust.encryption') },
    { icon: FileCheck, label: t('landing.trust.gdpr') },
    { icon: Users, label: t('landing.trust.trustedBy', { count: '10,000+' }) },
  ]

  return (
    <section className="px-4 py-12 sm:py-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('landing.trust.title')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('landing.trust.integrations')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {badges.map(({ icon: Icon, label }) => (
              <div
                key={String(label)}
                className="flex flex-col items-center gap-3 rounded-xl bg-card/80 p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28)]"
              >
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
