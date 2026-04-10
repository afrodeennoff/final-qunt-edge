import { Suspense, type ReactElement } from "react";
import { Loader2 } from "lucide-react";
import ImportCallbackPageClient from "@/app/[locale]/dashboard/import/page-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/locales/server";

interface ImportCallbackFallbackProps {
  title: string;
  description: string;
  status: string;
}

function ImportCallbackFallback({
  title,
  description,
  status,
}: ImportCallbackFallbackProps): ReactElement {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{status}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function ImportPage(): Promise<ReactElement> {
  const t = await getI18n();

  return (
    <Suspense
      fallback={
        <ImportCallbackFallback
          title={t("tradovateSync.callback.title")}
          description={t("tradovateSync.callback.processing")}
          status={t("tradovateSync.callback.exchangingCode")}
        />
      }
    >
      <ImportCallbackPageClient />
    </Suspense>
  );
}
