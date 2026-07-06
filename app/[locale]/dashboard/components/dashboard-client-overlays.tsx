"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useRithmicSyncStore } from "@/store/rithmic-sync-store";
import { useDashboardRefreshError, useDashboardActions } from "@/context/data-provider";

const Modals = dynamic(() => import("@/components/modals"), {
 
});

const RithmicSyncNotifications = dynamic(
 () =>
 import("./import/rithmic/sync/rithmic-notifications").then(
 (module) => module.RithmicSyncNotifications
 ),
 {
 
 }
);

export function DashboardClientOverlays() {
 const [ready, setReady] = useState(false);
 const pathname = usePathname();
  const isImportRoute = pathname?.endsWith("/dashboard/import") || pathname?.endsWith("/dashboard/import/");
 const { autoSyncEnabled: rithmicAutoEnabled } = useRithmicSyncStore();
 const hasActiveSync = isImportRoute || rithmicAutoEnabled;

 const refreshError = useDashboardRefreshError();
 const { retryDataLoad } = useDashboardActions();

 useEffect(() => {
 if (!refreshError) return;

 const toastId = toast.error("Failed to refresh dashboard data", {
 description: refreshError,
 action: {
 label:"Retry",
 onClick: () => retryDataLoad(),
 },
 duration: Infinity,
 });

 return () => {
 toast.dismiss(toastId);
 };
 }, [refreshError, retryDataLoad]);

 useEffect(() => {
 const schedule: (cb: IdleRequestCallback) => number =
 window.requestIdleCallback
 ? (cb) => window.requestIdleCallback(cb)
 : (cb) => window.setTimeout(() => cb({} as IdleDeadline), 250);
 const cancel: (id: number) => void =
 window.cancelIdleCallback
 ? (id) => window.cancelIdleCallback(id)
 : (id) => window.clearTimeout(id);
 const handle = schedule(() => setReady(true));

 return () => {
 cancel(handle);
 };
 }, []);

 if (!ready) return null;

 return (
 <>
 {hasActiveSync && <RithmicSyncNotifications />}
 <Modals />
 </>
 );
}
