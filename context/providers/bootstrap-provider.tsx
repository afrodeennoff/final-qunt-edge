'use client'

import { createContext, useContext } from 'react'
import type { DashboardBootstrapPayload } from '@/lib/types/bootstrap'

interface BootstrapContextValue {
  bootstrap: DashboardBootstrapPayload | null
  isBootstrapped: boolean
}

const BootstrapContext = createContext<BootstrapContextValue>({
  bootstrap: null,
  isBootstrapped: false,
})

interface DashboardBootstrapProviderProps {
  initialBootstrap?: DashboardBootstrapPayload | null
  children: React.ReactNode
}

export function DashboardBootstrapProvider({
  initialBootstrap,
  children,
}: DashboardBootstrapProviderProps) {
  const value: BootstrapContextValue = {
    bootstrap: initialBootstrap ?? null,
    isBootstrapped: !!initialBootstrap,
  }

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  )
}

export function useBootstrap() {
  return useContext(BootstrapContext)
}

export function useBootstrapData(): DashboardBootstrapPayload | null {
  const { bootstrap } = useContext(BootstrapContext)
  return bootstrap
}
