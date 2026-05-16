"use client"

import type { CSSProperties } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import type { DashboardTheme } from "@/lib/constants/dashboard-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { AuthTimeout } from "@/components/auth/auth-timeout";

const CHUNK_RECOVERY_SESSION_KEY = "chunk-reload-attempted";
const SERVICE_WORKER_CLEANUP_KEY = "sw-cleanup-v1";
let chunkRecoveryInProgress = false;

function shouldRecoverFromChunkError(reason: unknown): boolean {
    const message =
        reason instanceof Error
            ? reason.message
            : typeof reason === "string"
                ? reason
                : "";

    if (!message) return false;

    return (
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Loading CSS chunk") ||
        message.includes("CSS chunk") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Importing a module script failed") ||
        message.includes("ERR_MODULE_NOT_FOUND")
    );
}

export function RootProviders({
    children,
    themeScope = "fixed-purple",
    initialTheme,
}: {
    children: React.ReactNode
    themeScope?: "dashboard" | "fixed-purple"
    initialTheme?: DashboardTheme
}) {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            return;
        }

        const recoverFromChunkError = (reason: unknown) => {
            if (!shouldRecoverFromChunkError(reason)) {
                return;
            }

            if (chunkRecoveryInProgress) {
                return;
            }

            let alreadyAttempted = false;
            try {
                alreadyAttempted = sessionStorage.getItem(CHUNK_RECOVERY_SESSION_KEY) === "1";
            } catch {
                alreadyAttempted = false;
            }

            if (alreadyAttempted) {
                return;
            }

            chunkRecoveryInProgress = true;

            try {
                sessionStorage.setItem(CHUNK_RECOVERY_SESSION_KEY, "1");
            } catch {
                // Ignore storage errors; still attempt reload once per page instance.
            }

            setTimeout(() => {
                window.location.reload();
            }, 200);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            recoverFromChunkError(event.reason);
        };

        const handleWindowError = (event: ErrorEvent) => {
            recoverFromChunkError(event.error ?? event.message);
        };

        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        window.addEventListener("error", handleWindowError);

        return () => {
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
            window.removeEventListener("error", handleWindowError);
        };
    }, []);

    useEffect(() => {
        if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
            return;
        }

        const cacheDebugEnabled = process.env.NEXT_PUBLIC_CACHE_DEBUG === "true";
        const shouldCleanupServiceWorkers = process.env.NEXT_PUBLIC_DISABLE_SERVICE_WORKERS === "true";
        const logPrefix = "[CacheDebug]";

        if (!shouldCleanupServiceWorkers) {
            return;
        }

        const unregisterAllServiceWorkers = async () => {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
            const cacheKeys = await caches.keys();
            await Promise.all(
                cacheKeys
                    .filter((key) => key.startsWith("quntedge-static-"))
                    .map((key) => caches.delete(key))
            );
            if (cacheDebugEnabled) {
                console.warn(`${logPrefix} service worker disabled; existing registrations cleared.`);
            }
        };

        const handleLoad = () => {
            try {
                if (localStorage.getItem(SERVICE_WORKER_CLEANUP_KEY) === "1") {
                    return;
                }
            } catch {
                // Ignore storage errors and proceed once for this page load.
            }

            unregisterAllServiceWorkers().catch((error) => {
                if (cacheDebugEnabled) {
                    console.error(`${logPrefix} failed to clear service workers`, error);
                }
            });

            try {
                localStorage.setItem(SERVICE_WORKER_CLEANUP_KEY, "1");
            } catch {
                // Ignore storage errors.
            }
        };

        void handleLoad();

        if (document.readyState !== "complete") {
            window.addEventListener("load", handleLoad);
        }

        const handleControllerChange = () => {
            if (cacheDebugEnabled) {
                console.warn(`${logPrefix} service worker controller changed`, {
                    pathname: window.location.pathname,
                    hasController: Boolean(navigator.serviceWorker.controller),
                });
            }
        };
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

        return () => {
            window.removeEventListener("load", handleLoad);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
    }, []);

    return (
        <TooltipProvider>
            <ThemeProvider scope={themeScope} initialTheme={initialTheme}>
                <Toaster />
                {children}
            </ThemeProvider>
        </TooltipProvider>
    );
}

export function PublicRootProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RootProviders themeScope="fixed-purple">
            {children}
        </RootProviders>
    );
}

export function SidebarRootProviders({
    children,
    defaultOpen = true,
    withAuthTimeout = false,
    initialTheme,
    style,
}: {
    children: React.ReactNode
    defaultOpen?: boolean
    withAuthTimeout?: boolean
    initialTheme?: DashboardTheme
    style?: CSSProperties
}) {
    return (
        <RootProviders themeScope="dashboard" initialTheme={initialTheme}>
            <SidebarProvider defaultOpen={defaultOpen} style={style}>
                {withAuthTimeout ? <AuthTimeout /> : null}
                {children}
            </SidebarProvider>
        </RootProviders>
    );
}
