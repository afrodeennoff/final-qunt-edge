"use client"
import React from 'react'

import { DataProvider } from "@/context/data-provider";
import { DataStateProvider } from "@/context/providers/data-state-provider";
import { DataDerivedProvider } from "@/context/providers/data-derived-provider";
import { DataActionsProvider } from "@/context/providers/data-actions-provider";
import { DashboardBootstrapProvider } from "@/context/providers/bootstrap-provider";
import { SyncContextProvider } from "@/context/sync-context";
import type { DashboardBootstrapPayload } from "@/lib/types/bootstrap";

function DashboardProvidersInner({ children }: { children: React.ReactNode }) {
  return (
    <SyncContextProvider>
      {children}
    </SyncContextProvider>
  );
}

export function DashboardProviders({
  children,
  isAdmin = false,
  initialBootstrap = null,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  initialBootstrap?: DashboardBootstrapPayload | null;
}) {
  return (
    <DashboardBootstrapProvider initialBootstrap={initialBootstrap}>
      <DataProvider isAdmin={isAdmin} initialBootstrap={initialBootstrap}>
        <DataStateProvider>
          <DataDerivedProvider>
            <DataActionsProvider>
              <DashboardProvidersInner>{children}</DashboardProvidersInner>
            </DataActionsProvider>
          </DataDerivedProvider>
        </DataStateProvider>
      </DataProvider>
    </DashboardBootstrapProvider>
  );
}
