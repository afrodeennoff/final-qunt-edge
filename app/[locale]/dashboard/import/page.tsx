import { Suspense, type ReactElement } from "react";
import ImportCallbackPageClient from "@/app/[locale]/dashboard/import/page-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ImportPage(): Promise<ReactElement> {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md space-y-6 p-6">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      }
    >
      <ImportCallbackPageClient />
    </Suspense>
  );
}
