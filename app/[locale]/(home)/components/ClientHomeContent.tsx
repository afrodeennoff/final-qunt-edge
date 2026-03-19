"use client"

import Hero from './Hero'
import ProofStrip from './ProofStrip'

interface ClientHomeContentProps {
  locale: string
}

export default function ClientHomeContent({ locale }: ClientHomeContentProps) {
  return (
    <>
      <Hero locale={locale} />
      <ProofStrip />
    </>
  )
}
