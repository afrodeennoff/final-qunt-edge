import { setStaticParamsLocale } from "next-international/server";
import { I18nProviderClient } from "@/locales/client";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";

export default async function LocaleLayoutContent(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;
  setStaticParamsLocale(locale);

  return (
    <I18nProviderClient locale={locale}>
      <ConsentBannerLazy />
      {children}
    </I18nProviderClient>
  );
}
