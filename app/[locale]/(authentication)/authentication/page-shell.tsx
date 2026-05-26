'use client'

import AuthenticationPageClient from './page-client'
import { Suspense } from 'react'

export default function AuthenticationPageShell() {
  return (
    <Suspense fallback={null}>
      <AuthenticationPageClient />
    </Suspense>
  )
}
