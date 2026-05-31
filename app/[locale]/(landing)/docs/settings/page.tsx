import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/settings', title: 'Settings & Profile | Qunt Edge Docs', description: 'Manage your account settings, profile, and preferences.' })
}

export default async function DocsSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings &amp; Profile</h1>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Settings</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Update your username, email preferences, timezone, and other account-level configurations.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Trader Profile</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Your public trader profile showcases performance stats, winrate, equity curve, and recent trades. Share the link with your community.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Billing</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Manage your subscription plan, view payment history, and upgrade or downgrade.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Teams</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Create or join trading teams to share insights and compare performance.</p>
    </>
  )
}
