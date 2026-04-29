import { use } from 'react'
import { setStaticParamsLocale } from "next-international/server";
import { I18nProviderClient } from "@/locales/client";
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy";
import { LOCALE_SOFT_BORDER_STYLE } from "@/lib/constants/layout";

export default function LocaleLayoutContent(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = use(props.params);
  const { children } = props;
  setStaticParamsLocale(locale);

  return (
    <I18nProviderClient locale={locale}>
      <div className="qe-no-white-borders flex flex-1 flex-col" style={LOCALE_SOFT_BORDER_STYLE}>
        <ConsentBannerLazy />
        {children}
      </div>
    </I18nProviderClient>
  );
}
