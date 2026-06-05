import { Suspense } from 'react'
import { OAuthConsentContent } from './oauth-consent-content'

type PageProps = {
  searchParams: Promise<{ authorization_id?: string }>
}

function OAuthConsentFallback() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-sm text-muted-foreground">Loading authorization request…</p>
    </main>
  )
}

export default function OAuthConsentPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<OAuthConsentFallback />}>
      <OAuthConsentContent searchParams={searchParams} />
    </Suspense>
  )
}