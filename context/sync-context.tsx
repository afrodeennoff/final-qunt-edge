"use client";

import { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import {
  RithmicSyncContextProvider,
  useRithmicSyncContext,
} from "@/context/rithmic-sync-context";
import {
  TradovateSyncContextProvider,
  useTradovateSyncContext,
} from "@/context/tradovate-sync-context";
import {
  DxFeedSyncContextProvider,
  useDxFeedSyncContext,
} from "@/context/dxfeed-sync-context";

type SyncService = "rithmic" | "tradovate" | "dxfeed";

interface ManualSyncResult {
  service: SyncService;
  success: boolean;
  message: string;
  rateLimited?: boolean;
}

interface SyncContextValue {
  rithmic: ReturnType<typeof useRithmicSyncContext>;
  tradovate: ReturnType<typeof useTradovateSyncContext>;
  dxfeed: ReturnType<typeof useDxFeedSyncContext>;
  manualSync: (
    service: SyncService,
    identifier: string
  ) => Promise<ManualSyncResult | undefined>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

function SyncContextBridge({ children }: { children: ReactNode }) {
  const rithmic = useRithmicSyncContext();
  const tradovate = useTradovateSyncContext();
  const dxfeed = useDxFeedSyncContext();

  const manualSync = useCallback<SyncContextValue["manualSync"]>(
    async (service, identifier) => {
      if (service === "rithmic") {
        const result = await rithmic.performSyncForCredential(identifier);
        if (!result) return;

        return {
          service,
          success: result.success,
          message: result.message,
          rateLimited: result.rateLimited,
        };
      }

      const result =
        service === "tradovate"
          ? await tradovate.performSyncForAccount(identifier)
          : await dxfeed.performSyncForAccount(identifier);
      if (!result) return;

      return {
        service,
        success: result.success,
        message: result.message,
      };
    },
    [rithmic, tradovate, dxfeed]
  );

  const value = useMemo(
    () => ({
      rithmic,
      tradovate,
      dxfeed,
      manualSync,
    }),
    [manualSync, rithmic, tradovate, dxfeed]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function SyncContextProvider({ children }: { children: ReactNode }) {
  return (
    <RithmicSyncContextProvider>
      <TradovateSyncContextProvider>
        <DxFeedSyncContextProvider>
          <SyncContextBridge>{children}</SyncContextBridge>
        </DxFeedSyncContextProvider>
      </TradovateSyncContextProvider>
    </RithmicSyncContextProvider>
  );
}

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncContextProvider");
  }
  return context;
}
