'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Gauge, LockKeyhole, ShieldCheck, Workflow } from 'lucide-react'
import {
  unifiedBodyCopyClassName,
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionEyebrowClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'
import { UserAuthForm } from '../components/user-auth-form'

const VALUE_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description: 'Protected sessions, encrypted auth flow, and trusted providers.',
  },
  {
    icon: Workflow,
    title: 'Fast account access',
    description: 'Magic link and password recovery with cleaner handoff states.',
  },
  {
    icon: Gauge,
    title: 'Built for daily use',
    description: 'Low-friction sign-in tuned for traders who open this app every day.',
  },
]

const ACCESS_POINTS = [
  'Magic link and password sign-in',
  'Discord and Google authentication',
  'Protected session handling across every login method',
]

export default function AuthenticationPageClient() {
  const t = useI18n()
  const locale = useCurrentLocale()

  return (
    <main className="qe-v2-app-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_72%)] opacity-70" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_70%)] opacity-80" />
        <div className="absolute inset-0 marketing-grid opacity-[0.07]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className={cn(unifiedHeroPanelClassName, 'w-full', MARKETING_SHELL_WIDTH)}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.06fr)_minmax(460px,0.94fr)]">
            <section className="relative overflow-hidden p-6 sm:p-8 lg:border-r lg:border-[rgba(0,0,0,0.06)] lg:p-10 xl:p-12">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent" />

              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/${locale}`}
                  className={cn(
                    unifiedGhostActionClassName,
                    'px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground/60',
                  )}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to website</span>
                </Link>
                <span className={unifiedChipClassName}>Secure access</span>
              </div>

              <div className="auth-entrance-1 mt-10 max-w-[39rem] lg:mt-14">
                <span className={unifiedSectionEyebrowClassName}>Qunt Edge</span>
                <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] px-4 py-3 shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_14px_28px_-24px_rgba(0,0,0,0.64)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/18 bg-primary/10 text-primary">
                    <Logo className="h-4.5 w-4.5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
                      Daily trading access
                    </p>
                    <p className="pt-1 text-sm text-foreground/50">
                      Secure entry for the full workspace.
                    </p>
                  </div>
                </div>

                <h1 className="mt-8 text-balance text-4xl font-medium leading-[0.98] tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
                  Welcome back to your trading command center.
                </h1>
                <p className={cn(unifiedBodyCopyClassName, 'mt-5 max-w-xl text-foreground/60')}>
                  {t('authentication.description')}
                </p>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {VALUE_POINTS.map((point) => (
                    <div key={point.title} className={cn(unifiedMetricPanelClassName, 'p-4')}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/18 bg-primary/10 text-primary">
                          <point.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                            {point.title}
                          </p>
                          <p className="mt-1.5 text-xs leading-[1.65] text-foreground/50">
                            {point.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex items-center justify-center border-t border-[rgba(0,0,0,0.06)] p-6 sm:p-8 lg:border-t-0 lg:p-10 xl:p-12">
              <div className="auth-entrance-2 mx-auto w-full max-w-[560px]">
                <div className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Account access
                      </p>
                      <h2 className="pt-2 text-2xl font-semibold tracking-tight text-foreground">
                        Sign in to continue
                      </h2>
                      <p className="pt-2 text-sm text-foreground/50">
                        Use the method that fits your routine and resume exactly where you left off.
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/18 bg-primary/10 text-primary">
                      <LockKeyhole className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="mb-6 grid gap-2">
                    {ACCESS_POINTS.map((point) => (
                      <div
                        key={point}
                        className={cn(
                          unifiedInsetPanelClassName,
                          'flex items-center gap-2.5 px-3.5 py-3',
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-sm text-foreground/50">{point}</span>
                      </div>
                    ))}
                  </div>

                  <UserAuthForm />

                  <p className="mt-8 text-center text-[11px] leading-relaxed text-foreground/50">
                    {t('authentication.termsAndPrivacy.prefix')}{' '}
                    <Link
                      href={`/${locale}/terms`}
                      className="text-foreground/70 underline decoration-[rgba(0,0,0,0.06)] underline-offset-4 hover:text-foreground"
                    >
                      {t('authentication.termsAndPrivacy.terms')}
                    </Link>{' '}
                    {t('authentication.termsAndPrivacy.and')}{' '}
                    <Link
                      href={`/${locale}/privacy`}
                      className="text-foreground/70 underline decoration-[rgba(0,0,0,0.06)] underline-offset-4 hover:text-foreground"
                    >
                      {t('authentication.termsAndPrivacy.privacy')}
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
