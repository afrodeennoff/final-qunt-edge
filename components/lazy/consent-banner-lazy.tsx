'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from './use-idle-mount'

const ConsentBanner = dynamic(
  () => import('@/components/consent-banner').then((mod) => mod.ConsentBanner),
  {
    loading: () => null,
    ssr: false,
  }
)

function hasStoredConsent() {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage.getItem('cookieConsent') !== null
  } catch {
    return true
  }
}

export default function ConsentBannerLazy() {
  const idle = useIdleMount(1200)
  const shouldLoad = idle && !hasStoredConsent()

  return shouldLoad ? <ConsentBanner /> : null
}
