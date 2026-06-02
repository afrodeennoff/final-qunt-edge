'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, X, AlertCircle, Sparkles } from 'lucide-react'
import { useCurrentLocale, useI18n } from '@/locales/client'
import NumberFlow from '@number-flow/react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { buildWhopCheckoutUrl } from '@/lib/whop-checkout'
import { useCurrency } from '@/hooks/use-currency'
import { formatCurrencyAmount } from '@/lib/formatting/currency'

type BillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'lifetime'

type PlanPrice = {
  yearly: number
  quarterly: number
  monthly: number
  lifetime: number
}

type Plan = {
  name: string
  description: string
  price: PlanPrice
  features: string[]
  isPopular?: boolean
  isComingSoon?: boolean
}

type Plans = Record<string, Plan>

type CurrentSubscription = {
  id: string
  status: string
  plan: {
    id: string
    name: string
    interval: string
  }
} | null

interface PricingPlansProps {
  isModal?: boolean
  onClose?: () => void
  onSuccess?: () => void | Promise<void>
  trigger?: React.ReactNode
  currentSubscription?: CurrentSubscription
}

const PREVIOUS_PRICING = {
  yearly: 300,
  quarterly: 82.5,
  monthly: 29.99,
  lifetime: 500,
}

function getPlanHref({
  planName,
  billingMode,
  currency,
  locale,
}: {
  planName: string
  billingMode: 'monthly' | 'annual'
  currency: 'USD' | 'EUR'
  locale: string
}): string {
  if (planName === 'Pro AI') {
    return buildWhopCheckoutUrl({
      lookupKey: `plus_${billingMode === 'annual' ? 'yearly' : 'monthly'}_${currency.toLowerCase()}`,
      locale,
    })
  }

  if (planName === 'Desk') {
    return `/${locale}/support`
  }

  return `/${locale}/authentication?next=dashboard`
}

function formatPlanAmount(
  value: number,
  currency: 'USD' | 'EUR',
  displayLocale: string,
  maximumFractionDigits = 2,
): string {
  return formatCurrencyAmount(value, currency, {
    locale: displayLocale,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

function getPlanCardClassName(popular: boolean): string {
  return cn(
    'relative flex w-full flex-col overflow-hidden transition-[opacity,background-color,border-color,transform] duration-300 hover:-translate-y-1',
    !popular && 'rounded-2xl border-0 bg-card shadow-sm',
    popular && 'relative rounded-2xl border-0 bg-card shadow-sm shadow-primary/10 ring-1 ring-primary/30',
  )
}

function getPlanCtaClassName(): string {
  return cn(
    'h-12 w-full rounded-xl text-[10px] font-black uppercase tracking-[0.12em]',
    '[font-family:var(--home-copy)]'
  )
}

function PlanPopularBadge({ popular }: { popular: boolean }) {
  if (!popular) return null

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary shadow-sm">
      <Sparkles className="h-3 w-3" />
      <span>Popular</span>
    </div>
  )
}

function hasLifetimeSubscription(subscription?: CurrentSubscription): boolean {
  return subscription?.plan?.interval === 'lifetime'
}

function isCurrentPlan(subscription: CurrentSubscription | undefined, lookupKey: string): boolean {
  if (!subscription) return false

  const parts = lookupKey.split('_')
  const planType = parts[0]
  const interval = parts[1]

  if (interval === 'lifetime') return false

  const intervalMap: Record<string, string> = {
    yearly: 'year',
    monthly: 'month',
    quarterly: 'quarter',
  }

  return (
    planType.toLowerCase() === 'plus' &&
    subscription.plan.name.toLowerCase().includes('plus') &&
    intervalMap[interval] === subscription.plan.interval
  )
}

function isBlockedFromRecurring(
  subscription: CurrentSubscription | undefined,
  lookupKey: string,
): boolean {
  if (!hasLifetimeSubscription(subscription)) return false

  const parts = lookupKey.split('_')
  const interval = parts[1]

  return ['yearly', 'monthly', 'quarterly'].includes(interval)
}

function isBlockedFromLifetime(
  subscription: CurrentSubscription | undefined,
  lookupKey: string,
): boolean {
  if (!hasLifetimeSubscription(subscription)) return false

  const parts = lookupKey.split('_')
  const interval = parts[1]

  return interval === 'lifetime'
}

function FreePlanCard({
  plan,
  isModal,
  onClose,
  locale,
  currency,
}: {
  plan: Plan
  isModal?: boolean
  onClose?: () => void
  locale: string
  currency: 'USD' | 'EUR'
}) {
  const t = useI18n()
  const href = getPlanHref({ planName: plan.name, billingMode: 'monthly', currency, locale })

  return (
    <div className="relative">
      <Card className={getPlanCardClassName(plan.isPopular ?? false)}>
        <CardHeader>
          <CardTitle className="text-[15px] font-black tracking-[-0.02em] text-foreground">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-2">
            <NumberFlow
              value={0}
              format={{
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }}
              className="text-[40px] font-[250] tracking-[-0.05em] text-foreground leading-none"
            />
            <span className="ml-1 text-[13px] text-muted-foreground/70 font-medium tracking-[-0.01em]">{t('pricing.free.name')}</span>
          </div>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2.5 text-[13px] text-foreground/70 tracking-[-0.005em]"
              >
                {index > 2 ? (
                  <X className="size-4 shrink-0 text-destructive" />
                ) : (
                  <Check className="size-4 text-semantic-success shrink-0" />
                )}
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {isModal ? (
            <Button onClick={onClose} className={getPlanCtaClassName()}>
              {t('pricing.keepBasic')}
            </Button>
          ) : (
            <Button asChild className={getPlanCtaClassName()}>
              <Link href={href}>{t('pricing.startBasic')}</Link>
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {t('terms.pricing.freePlanDisclaimer')}
            <Link href={`/${locale}/terms`} className="text-primary hover:underline">
              {t('terms.pricing.termsOfService')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function PlusPlanCard({
  plan,
  billingPeriod,
  setBillingPeriod,
  currency,
  locale,
  currentSubscription,
  isLoading,
  onPlanSwitch,
  onPromptLifetime,
}: {
  plan: Plan
  billingPeriod: BillingPeriod
  setBillingPeriod: (period: BillingPeriod) => void
  currency: 'USD' | 'EUR'
  locale: string
  currentSubscription?: CurrentSubscription
  isLoading: boolean
  onPlanSwitch: (lookupKey: string) => Promise<void>
  onPromptLifetime: (lookupKey: string) => void
}) {
  const t = useI18n()
  const displayLocale = currency === 'EUR' ? 'fr-FR' : 'en-US'

  const currentPricing = useMemo(
    () =>
      billingPeriod === 'yearly'
        ? plan.price.yearly / 12
        : billingPeriod === 'quarterly'
          ? plan.price.quarterly / 3
          : billingPeriod === 'lifetime'
            ? plan.price.lifetime
            : plan.price.monthly,
    [billingPeriod, plan.price],
  )

  const previousPrice = useMemo(
    () =>
      billingPeriod === 'yearly'
        ? PREVIOUS_PRICING.yearly / 12
        : billingPeriod === 'quarterly'
          ? PREVIOUS_PRICING.quarterly / 3
          : billingPeriod === 'lifetime'
            ? PREVIOUS_PRICING.lifetime
            : PREVIOUS_PRICING.monthly,
    [billingPeriod],
  )

  const recurringBillingOptions = useMemo(
    () => [
      {
        key: 'monthly' as BillingPeriod,
        label: t('pricing.monthly'),
        description: t('pricing.monthlyFlexibility'),
      },
      {
        key: 'quarterly' as BillingPeriod,
        label: t('pricing.quarterly'),
        description: `${formatPlanAmount(plan.price.quarterly, currency, displayLocale, 0)} billed quarterly (${formatPlanAmount(plan.price.quarterly / 3, currency, displayLocale, 2)}/month)`,
      },
      {
        key: 'yearly' as BillingPeriod,
        label: t('pricing.yearly'),
        description: `${formatPlanAmount(plan.price.yearly, currency, displayLocale, 0)} billed yearly (${formatPlanAmount(plan.price.yearly / 12, currency, displayLocale, 2)}/month)`,
      },
    ],
    [currency, displayLocale, plan.price.quarterly, plan.price.yearly, t],
  )

  const lookupKey = `plus_${billingPeriod}_${currency.toLowerCase()}`
  const current = isCurrentPlan(currentSubscription, lookupKey)
  const blockedRecurring = isBlockedFromRecurring(currentSubscription, lookupKey)
  const blockedLifetime = isBlockedFromLifetime(currentSubscription, lookupKey)
  const blocked = blockedRecurring || blockedLifetime
  const shouldShowLifetimeConfirmation = billingPeriod === 'lifetime' && !current

  const handlePrimaryClick = () => {
    if (blocked) return
    if (shouldShowLifetimeConfirmation) {
      onPromptLifetime(lookupKey)
      return
    }
    void onPlanSwitch(lookupKey)
  }

  const primaryButtonText = isLoading
    ? billingPeriod === 'lifetime'
      ? t('billing.lifetimeUpgrade')
      : t('billing.switching')
    : current
      ? t('billing.currentPlan')
      : blockedLifetime
        ? t('billing.lifetimeOwned')
        : blockedRecurring
          ? t('billing.lifetimeActive')
          : currentSubscription
            ? billingPeriod === 'lifetime'
              ? t('pricing.upgradeToLifetime')
              : t('billing.changePlan')
            : t('pricing.trialPeriod')

  return (
    <div className="relative z-10 w-full">
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-primary/5 to-transparent animate-pulse-slow" />
      <Card className={getPlanCardClassName(true)}>
        <PlanPopularBadge popular={plan.isPopular ?? true} />
        <CardHeader>
          <CardTitle className="text-[15px] font-black tracking-[-0.02em] text-foreground">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {plan.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3 rounded-xl border-0 bg-background/0.04 p-4">
            <span className="block text-center text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {t('pricing.billingPeriod')}
            </span>

            <div className="grid grid-cols-3 gap-1 rounded-[1rem] border-0 bg-background/25 p-1">
              {recurringBillingOptions.map((option) => (
                <button
                  key={option.key}
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs capitalize transition-[opacity,background-color,border-color,transform]',
                    billingPeriod === option.key
                       ? 'bg-primary text-primary-foreground font-semibold shadow-[0_8px_20px_-12px_hsl(var(--primary)/0.45)]'
                      : 'text-muted-foreground/75 hover:bg-background/0.09 hover:text-foreground',
                  )}
                  onClick={() => setBillingPeriod(option.key)}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="border-t border-transparent.04 pt-3">
              <button
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-[1rem] border px-3 py-2 text-xs font-medium transition-[opacity,background-color,border-color,transform]',
                  billingPeriod === 'lifetime'
                    ? 'border-primary/28 bg-primary/8 text-primary'
                    : 'border-transparent.06 text-muted-foreground hover:bg-background/0.09 hover:text-foreground',
                )}
                onClick={() => setBillingPeriod('lifetime')}
              >
                {t('pricing.lifetimeAccess')}
                <Badge
                  variant="secondary"
                  className="border border-warning bg-warning/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-warning"
                >
                  {t('pricing.limitedTimeOffer')}
                </Badge>
              </button>
            </div>
          </div>

          <div className="mb-4 text-center">
            {billingPeriod === 'lifetime' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative text-lg text-muted-foreground">
                    <NumberFlow
                      value={previousPrice}
                      format={{
                        style: 'currency',
                        currency: currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-px w-full bg-current" />
                    </div>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <NumberFlow
                    value={currentPricing}
                    format={{
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    className="text-[40px] font-[250] tracking-[-0.05em] text-foreground leading-none"
                  />
                </div>
                <p className="text-[13px] text-muted-foreground/70 font-medium tracking-[-0.01em]">
                  {t('pricing.oneTimePayment')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <NumberFlow
                  value={currentPricing}
                  format={{
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                  className="text-[40px] font-[250] tracking-[-0.05em] text-foreground leading-none"
                />
                <p className="text-[13px] text-muted-foreground/70 font-medium tracking-[-0.01em]">
                  {billingPeriod === 'monthly'
                    ? t('pricing.monthlyFlexibility')
                    : billingPeriod === 'yearly'
                      ? t('pricing.billedYearly', { total: plan.price.yearly })
                      : t('pricing.billedQuarterly', { total: plan.price.quarterly })}
                </p>
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2.5 text-[13px] text-foreground/70 tracking-[-0.005em]"
              >
                <Check className="size-4 text-semantic-success shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {billingPeriod === 'lifetime' && (
            <div className="mt-4 border-t border-transparent pt-3">
              <div className="gap-1">
                <p className="text-xs text-muted-foreground">
                  • {t('pricing.lifetimeDisclaimer1')}
                </p>
                <p className="text-xs text-muted-foreground">
                  • {t('pricing.lifetimeDisclaimer2')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handlePrimaryClick}
            disabled={isLoading || current || blocked}
            variant={current || blocked ? 'outline' : 'default'}
            className={`w-full ${getPlanCtaClassName()}`}
          >
            {primaryButtonText}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t('terms.pricing.disclaimer')}
            <Link href={`/${locale}/terms`} className="text-primary hover:underline">
              {t('terms.pricing.termsOfService')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function PricingPlansContent({
  isModal,
  onClose,
  locale,
  currency,
  billingPeriod,
  setBillingPeriod,
  currentSubscription,
  isLoading,
  showLifetimeConfirm,
  setShowLifetimeConfirm,
  setPendingLookupKey,
  handlePlanSwitch,
  handleLifetimeConfirm,
}: {
  isModal?: boolean
  onClose?: () => void
  locale: string
  currency: 'USD' | 'EUR'
  billingPeriod: BillingPeriod
  setBillingPeriod: (period: BillingPeriod) => void
  currentSubscription?: CurrentSubscription
  isLoading: boolean
  showLifetimeConfirm: boolean
  setShowLifetimeConfirm: (open: boolean) => void
  setPendingLookupKey: (value: string) => void
  handlePlanSwitch: (lookupKey: string) => Promise<void>
  handleLifetimeConfirm: () => Promise<void>
}) {
  const t = useI18n()

  const pricing = useMemo(
    () => ({
      yearly: 120,
      quarterly: 45,
      monthly: 19.99,
      lifetime: 300,
    }),
    [],
  )

  const plans: Plans = useMemo(
    () => ({
      basic: {
        name: t('pricing.basic.name'),
        description: t('pricing.basic.description'),
        price: { yearly: 0, quarterly: 0, monthly: 0, lifetime: 0 },
        features: [
          t('pricing.basic.feature1'),
          t('pricing.basic.feature2'),
          t('pricing.basic.feature3'),
          t('pricing.basic.feature6'),
          t('pricing.basic.feature7'),
          t('pricing.basic.feature8'),
          t('pricing.basic.feature9'),
          t('pricing.basic.feature10'),
          t('pricing.basic.feature11'),
          t('pricing.basic.feature12'),
        ],
      },
      plus: {
        name: t('pricing.plus.name'),
        description: t('pricing.plus.description'),
        price: pricing,
        isPopular: true,
        features: [
          t('pricing.plus.feature1'),
          t('pricing.plus.feature2'),
          t('pricing.plus.feature6'),
        ],
      },
    }),
    [pricing, t],
  )

  return (
    <div className="sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 stagger-reveal">
        <FreePlanCard
          plan={plans.basic}
          isModal={isModal}
          onClose={onClose}
          locale={locale}
          currency={currency}
        />
        <PlusPlanCard
          plan={plans.plus}
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          currency={currency}
          locale={locale}
          currentSubscription={currentSubscription}
          isLoading={isLoading}
          onPlanSwitch={handlePlanSwitch}
          onPromptLifetime={(lookupKey) => {
            setPendingLookupKey(lookupKey)
            setShowLifetimeConfirm(true)
          }}
        />
      </div>

      <Dialog open={showLifetimeConfirm} onOpenChange={setShowLifetimeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pricing.lifetimeUpgrade.title')}</DialogTitle>
            <DialogDescription>{t('pricing.lifetimeUpgrade.description')}</DialogDescription>
          </DialogHeader>
          <div className="gap-4 py-4">
            <div className="rounded-lg border border-semantic-warning-border bg-semantic-warning-bg p-4">
              <div className="flex items-start">
                <AlertCircle className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-semantic-warning" />
                <div className="gap-2">
                  <p className="text-sm font-medium text-semantic-warning">
                    {t('pricing.lifetimeUpgrade.warning')}
                  </p>
                  <ul className="list-disc gap-1 pl-5 text-sm text-semantic-warning">
                    <li>{t('pricing.lifetimeUpgrade.warningPoints.currentPlan')}</li>
                    <li>{t('pricing.lifetimeUpgrade.warningPoints.immediateCancel')}</li>
                    <li>{t('pricing.lifetimeUpgrade.warningPoints.oneTimePayment')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {currentSubscription && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-medium">
                  {t('pricing.lifetimeUpgrade.currentSubscription')}
                </h4>
                <div className="gap-1 text-sm text-muted-foreground">
                  <p>
                    <strong>{t('billing.currentPlan')}:</strong> {currentSubscription.plan.name}
                  </p>
                  <p>
                    <strong>{t('billing.billingPeriod')}:</strong>{' '}
                    {currentSubscription.plan.interval}
                  </p>
                  <p>
                    <strong>{t('billing.status.active')}:</strong> {t('billing.status.active')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLifetimeConfirm(false)}
              disabled={isLoading}
            >
              {t('pricing.lifetimeUpgrade.cancel')}
            </Button>
            <Button onClick={handleLifetimeConfirm} disabled={isLoading}>
              {isLoading ? t('billing.lifetimeUpgrade') : t('pricing.lifetimeUpgrade.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-8 text-center text-xs text-muted-foreground/80 [font-family:var(--home-copy)]">
        Transparent pricing. No hidden data limits. Upgrade only when your review process needs more
        depth.
      </p>
    </div>
  )
}

export default function PricingPlans({
  isModal,
  onClose,
  onSuccess,
  trigger,
  currentSubscription,
}: PricingPlansProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('lifetime')
  const [isLoading, setIsLoading] = useState(false)
  const [showLifetimeConfirm, setShowLifetimeConfirm] = useState(false)
  const [pendingLookupKey, setPendingLookupKey] = useState<string>('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const t = useI18n()
  const locale = useCurrentLocale()
  const { currency } = useCurrency()
  const router = useRouter()

  const ensureReferralCode = async () => {
    if (referralCode !== null) return referralCode
    if (typeof window === 'undefined') return null
    const { getReferralCode } = await import('@/lib/referral-storage')
    const ref = getReferralCode()
    setReferralCode(ref ?? '')
    return ref
  }

  const handlePlanSwitch = async (lookupKey: string) => {
    if (!currentSubscription) {
      const resolvedReferral = await ensureReferralCode()
      window.location.assign(
        buildWhopCheckoutUrl({
          lookupKey,
          referral: resolvedReferral,
          locale,
        }),
      )
      return
    }

    if (isCurrentPlan(currentSubscription, lookupKey)) {
      toast.error(t('billing.error'), {
        description: t('billing.alreadyOnPlan'),
      })
      return
    }

    if (isBlockedFromRecurring(currentSubscription, lookupKey)) {
      toast.error(t('billing.error'), {
        description: t('billing.lifetimeNoDowngrade'),
      })
      return
    }

    if (isBlockedFromLifetime(currentSubscription, lookupKey)) {
      toast.error(t('billing.error'), {
        description: t('billing.lifetimeAlreadyOwned'),
      })
      return
    }

    if (lookupKey.includes('lifetime')) {
      setPendingLookupKey(lookupKey)
      setShowLifetimeConfirm(true)
      return
    }

    await executePlanSwitch(lookupKey)
  }

  const executePlanSwitch = async (lookupKey: string) => {
    setIsLoading(true)

    try {
      const { switchSubscriptionPlan } = await import('@/server/billing')
      const result = await switchSubscriptionPlan(lookupKey)

      if (result.success) {
        toast.success(t('billing.planSwitched'), {
          description: t('billing.planSwitchedDescription'),
        })

        await onSuccess?.()
        router.refresh()
      } else if ('requiresCheckout' in result && result.requiresCheckout) {
        const finalLookupKey = result.lookupKey || lookupKey
        const resolvedReferral = await ensureReferralCode()
        window.location.assign(
          buildWhopCheckoutUrl({
            lookupKey: finalLookupKey,
            referral: resolvedReferral,
            locale,
          }),
        )
      } else {
        toast.error(t('billing.error'), {
          description: result.error,
        })
      }
    } catch {
      toast.error(t('billing.error'), {
        description: t('billing.planSwitchError'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLifetimeConfirm = async () => {
    setShowLifetimeConfirm(false)
    await executePlanSwitch(pendingLookupKey)
  }

  const content = (
    <PricingPlansContent
      isModal={isModal}
      onClose={onClose}
      locale={locale}
      currency={currency}
      billingPeriod={billingPeriod}
      setBillingPeriod={setBillingPeriod}
      currentSubscription={currentSubscription}
      isLoading={isLoading}
      showLifetimeConfirm={showLifetimeConfirm}
      setShowLifetimeConfirm={setShowLifetimeConfirm}
      setPendingLookupKey={setPendingLookupKey}
      handlePlanSwitch={handlePlanSwitch}
      handleLifetimeConfirm={handleLifetimeConfirm}
    />
  )

  if (trigger) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">{content}</DialogContent>
      </Dialog>
    )
  }

  return content
}
