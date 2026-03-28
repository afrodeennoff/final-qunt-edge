import { Suspense } from "react";
import { I18nProviderClient } from "@/locales/client";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";
import LocaleLayoutContent from "./layout-content";

const FALLBACK_LOCALE = "en";

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
          {children}
        </I18nProviderClient>
      }
    >
      <LocaleLayoutContent params={props.params}>
        {children}
      </LocaleLayoutContent>
    </Suspense>
  );
}
