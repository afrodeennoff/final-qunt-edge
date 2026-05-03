
'use client'

import AuthenticationPageClient from './page-client'
import { Suspense } from 'react'

function ShellFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  )
}

export default function AuthenticationPageShell() {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AuthenticationPageClient />
    </Suspense>
  )
}
