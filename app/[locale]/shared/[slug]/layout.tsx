import React from 'react'
import MarketingLayoutShell from '../../(landing)/components/marketing-layout-shell'
import { PublicRootProviders } from '@/components/providers/root-providers'
import { WORKSPACE_SHELL_WIDTH } from '@/lib/constants/layout'

export default function SharedSlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <PublicRootProviders>
      <MarketingLayoutShell contentClassName={`mx-auto w-full ${WORKSPACE_SHELL_WIDTH}`} className="public-page">
        {children}
      </MarketingLayoutShell>
    </PublicRootProviders>
  )
}
