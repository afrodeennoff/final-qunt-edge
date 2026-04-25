import { Suspense } from "react";
import { I18nProviderClient } from "@/locales/client";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";
import LocaleLayoutContent from "./layout-content";

const FALLBACK_LOCALE = "en";

function LocaleFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}

export default function RootLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { children } = props;

  return (
    <Suspense
      fallback={
        <I18nProviderClient locale={FALLBACK_LOCALE}>
          <ConsentBannerLazy />
          <LocaleFallback />
        </I18nProviderClient>
      }
    >
      <LocaleLayoutContent params={props.params}>
        {children}
      </LocaleLayoutContent>
    </Suspense>
  );
}
