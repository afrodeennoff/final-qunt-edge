import { I18nProviderClient } from "@/locales/client"
import { setStaticParamsLocale } from "next-international/server"
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy"
import { LOCALE_SOFT_BORDER_STYLE } from "@/lib/constants/layout"

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // CRITICAL: bind locale on server
  setStaticParamsLocale(locale)

  return (
    <I18nProviderClient locale={locale}>
      <div
        className="qe-no-white-borders flex flex-1 flex-col"
        style={LOCALE_SOFT_BORDER_STYLE}
      >
        <ConsentBannerLazy />
        {children}
      </div>
    </I18nProviderClient>
  )
}
