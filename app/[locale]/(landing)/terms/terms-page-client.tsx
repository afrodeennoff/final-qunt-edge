'use client'

import React from 'react'
import { useI18n } from '@/locales/client'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { MarketingSectionHeader } from '@/components/layout/marketing-sections'

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function TermsPageClient() {
  const t = useI18n()

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface className="space-y-6 text-muted-foreground">
        <header className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            These terms describe account usage, payment policies, and service responsibilities for Qunt Edge.
          </p>
        </header>

        <LegalSection title={t('terms.sections.companyInfo.title')}>
          <p>{t('terms.sections.companyInfo.content')}</p>
          <p>
            {t('terms.sections.companyInfo.contact')}
            <a
              href="mailto:contact@qunt-edge.com"
              className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            >
              contact@qunt-edge.com
            </a>
          </p>
        </LegalSection>

        <LegalSection title={t('terms.sections.services.title')}>
          <p>{t('terms.sections.services.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.userAccounts.title')}>
          <p>{t('terms.sections.userAccounts.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.subscriptionPayments.title')}>
          <p>{t('terms.sections.subscriptionPayments.content')}</p>
          <h3 className="pt-2 text-lg font-semibold tracking-tight text-foreground">
            {t('terms.sections.subscriptionPayments.storageClarification')}
          </h3>
          <p>{t('terms.sections.subscriptionPayments.fairUse')}</p>
          <h3 className="pt-2 text-lg font-semibold tracking-tight text-foreground">
            {t('terms.sections.subscriptionPayments.lifetimePlan.title')}
          </h3>
          <p>{t('terms.sections.subscriptionPayments.lifetimePlan.description')}</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition1')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition2')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition3')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition4')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition5')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition6')}</li>
          </ul>
        </LegalSection>

        <LegalSection title={t('terms.sections.intellectualProperty.title')}>
          <p>{t('terms.sections.intellectualProperty.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.dataProtection.title')}>
          <p>{t('terms.sections.dataProtection.content')}</p>
          <p>{t('terms.sections.dataProtection.dataExport')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.liability.title')}>
          <p>{t('terms.sections.liability.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.termination.title')}>
          <p>{t('terms.sections.termination.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.serviceAvailability.title')}>
          <p>{t('terms.sections.serviceAvailability.description')}</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>{t('terms.sections.serviceAvailability.condition1')}</li>
            <li>{t('terms.sections.serviceAvailability.condition2')}</li>
            <li>{t('terms.sections.serviceAvailability.condition3')}</li>
          </ul>
          <p>{t('terms.sections.serviceAvailability.notice')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.governingLaw.title')}>
          <p>{t('terms.sections.governingLaw.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.changesTerms.title')}>
          <p>{t('terms.sections.changesTerms.content')}</p>
        </LegalSection>

        <p className="border-t-0 pt-5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {t('terms.lastUpdated')}
          {new Date().toISOString().split('T')[0]}
        </p>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
