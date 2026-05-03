import { Suspense, type ReactElement } from "react";
import ImportCallbackPageClient from "@/app/[locale]/dashboard/import/page-client";

export default async function ImportPage(): Promise<ReactElement> {
  return (
    <Suspense fallback={null}>
      <ImportCallbackPageClient />
    </Suspense>
  );
}
