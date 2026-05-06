'use client'

import dynamic from 'next/dynamic'

const ConsentBanner = dynamic(
  () => import('@/components/consent-banner').then((mod) => mod.ConsentBanner),
  {  }
)

export default function ConsentBannerLazy() {
  return <ConsentBanner />
}
