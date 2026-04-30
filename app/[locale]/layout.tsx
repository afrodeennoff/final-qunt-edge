import { Suspense } from "react"
import LocaleLayoutContent from "./layout-content"

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
      <LocaleLayoutContent>
        {props.children}
      </LocaleLayoutContent>
    </Suspense>
  )
}
