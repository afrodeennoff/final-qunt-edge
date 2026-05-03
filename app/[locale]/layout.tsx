import { Suspense } from "react"
import { I18nProviderClient } from "@/locales/client"
import { setStaticParamsLocale } from "next-international/server"
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy"
import { LOCALE_SOFT_BORDER_STYLE } from "@/lib/constants/layout"

export default function LocaleLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <Suspense fallback={null}>
      <LocaleLayoutInner {...props} />
    </Suspense>
  )
}

async function LocaleLayoutInner({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

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
