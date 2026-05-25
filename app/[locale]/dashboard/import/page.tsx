import { Suspense, type ReactElement } from "react";
import ImportCallbackPageClient from "@/app/[locale]/dashboard/import/page-client";

export default async function ImportPage(): Promise<ReactElement> {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md space-y-6 p-6">
          <div className="h-48 animate-pulse rounded-xl border border-border/30 bg-muted/40" />
        </div>
      }
    >
      <ImportCallbackPageClient />
    </Suspense>
  );
}
