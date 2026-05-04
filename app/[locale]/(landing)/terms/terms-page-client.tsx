'use client'

import React from 'react'
import { useI18n } from '@/locales/client'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { MarketingSectionHeader } from '@/components/layout/marketing-sections'

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-fg-primary">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-fg-muted">{children}</div>
    </section>
  )
}

export function TermsPageClient() {
  const t = useI18n()

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-20 lg:py-24">
      <UnifiedSurface className="space-y-10">
        <MarketingSectionHeader
          eyebrow="Legal"
          title="Terms of Service"
          titleAs="h1"
          align="left"
          className="m-0"
          description="These terms describe account usage, payment policies, and service responsibilities for Qunt Edge."
        />
        <LegalSection title={t('terms.sections.companyInfo.title')}>
          <p>{t('terms.sections.companyInfo.content')}</p>
          <p>
            {t('terms.sections.companyInfo.contact')}
            <a
              href="mailto:contact@qunt-edge.com"
              className="text-primary underline underline-offset-4 transition-colors duration-200 hover:text-primary/80"
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
          <h3 className="pt-2 text-lg font-semibold text-fg-primary">
            {t('terms.sections.subscriptionPayments.storageClarification')}
          </h3>
          <p>{t('terms.sections.subscriptionPayments.fairUse')}</p>
          <h3 className="pt-2 text-lg font-semibold text-fg-primary">
            {t('terms.sections.subscriptionPayments.lifetimePlan.title')}
          </h3>
          <p>{t('terms.sections.subscriptionPayments.lifetimePlan.description')}</p>
          <ul className="list-disc pl-6 space-y-1.5">
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
          <ul className="list-disc pl-6 space-y-1.5">
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

        <p className="border-t border-[rgba(0,0,0,0.08)] pt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('terms.lastUpdated')}
          {new Date().toISOString().split('T')[0]}
        </p>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
