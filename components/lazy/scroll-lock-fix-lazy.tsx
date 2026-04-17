'use client'

import dynamic from 'next/dynamic'

const ScrollLockFix = dynamic(
  () => import('@/components/scroll-lock-fix').then((mod) => mod.ScrollLockFix),
  {  }
)

export default function ScrollLockFixLazy() {
  return <ScrollLockFix />
}
