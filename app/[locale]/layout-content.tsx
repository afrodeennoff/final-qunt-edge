"use client"

import { useParams } from "next/navigation"
import { I18nProviderClient } from "@/locales/client"
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy"
import { LOCALE_SOFT_BORDER_STYLE } from "@/lib/constants/layout"

export default function LocaleLayoutContent(props: {
  children: React.ReactNode
}) {
  const params = useParams()
  const locale = (params?.locale as string) || "en"
  const { children } = props

  return (
    <I18nProviderClient locale={locale}>
      <div className="qe-no-white-borders flex flex-1 flex-col" style={LOCALE_SOFT_BORDER_STYLE}>
        <ConsentBannerLazy />
        {children}
      </div>
    </I18nProviderClient>
  )
}
