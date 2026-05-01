import { Suspense } from "react"
import { I18nProviderClient } from "@/locales/client"
import ConsentBannerLazy from "@/components/lazy/consent-banner-lazy"
import { LOCALE_SOFT_BORDER_STYLE } from "@/lib/constants/layout"

function PageFallback() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  )
}

export default function LocaleLayout(props: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <LocaleLayoutInner {...props} />
    </Suspense>
  )
}

async function LocaleLayoutInner(props: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  const { locale } = await props.params

  return (
    <I18nProviderClient locale={locale}>
      <div className="qe-no-white-borders flex flex-1 flex-col" style={LOCALE_SOFT_BORDER_STYLE}>
        {/* Remove the initial-loader overlay once content renders */}
        <script dangerouslySetInnerHTML={{ __html: 'var _l=document.getElementById("initial-loader");if(_l){_l.style.transition="opacity .2s";_l.style.opacity="0";setTimeout(function(){_l.remove()},200)}' }} />
        <ConsentBannerLazy />
        {props.children}
      </div>
    </I18nProviderClient>
  )
}
