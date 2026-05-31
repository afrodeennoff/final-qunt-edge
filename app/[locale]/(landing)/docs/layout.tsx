import { setStaticParamsLocale } from 'next-international/server'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { DocsSidebar } from './components/docs-sidebar'

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <div className="flex gap-8">
        <aside className="hidden shrink-0 lg:block transition-all">
          <DocsSidebar locale={locale} />
        </aside>
        <main className="min-w-0 flex-1">
          <UnifiedSurface className="space-y-6 p-6">
            {children}
          </UnifiedSurface>
        </main>
      </div>
    </UnifiedPageShell>
  )
}
