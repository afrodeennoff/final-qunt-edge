'use client'

import dynamic from 'next/dynamic'
import { useIdleMount } from './use-idle-mount'

const ScrollLockFix = dynamic(
  () => import('@/components/scroll-lock-fix').then((mod) => mod.ScrollLockFix),
  {
    loading: () => null,
    ssr: false,
  }
)

export default function ScrollLockFixLazy() {
  const idle = useIdleMount(700)

  return idle ? <ScrollLockFix /> : null
}
