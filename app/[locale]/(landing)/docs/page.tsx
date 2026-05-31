import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import Link from 'next/link'
import { BookOpen, Brain, Cable, Code2 } from 'lucide-react'
import { buildPublicMetadata } from '@/lib/seo'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/docs',
    title: 'Documentation | Qunt Edge',
    description:
      'Guides and references for Qunt Edge trading journal, analytics workflows, and integrations.',
  })
}

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface className="space-y-6">
        <header className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Documentation</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Documentation
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Everything you need to master Qunt Edge workflows.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <UnifiedSurface variant="subtle">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border-0 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">Getting Started</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              New to Qunt Edge? Learn the basics and set up your institutional-grade dashboard in minutes.
            </p>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </span>
          </UnifiedSurface>

          <UnifiedSurface variant="subtle">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border-0 text-primary">
              <Cable className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">Data Connectors</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Detailed guides on connecting Tradovate, Rithmic, IBKR, and more to your intelligence layer.
            </p>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </span>
          </UnifiedSurface>

          <UnifiedSurface variant="subtle">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border-0 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">AI Journaling</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              How to leverage our unique AI models to audit your behavioral execution, not just your PnL.
            </p>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </span>
          </UnifiedSurface>

          <UnifiedSurface variant="subtle">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border-0 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">API Reference</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              For power users and institutions looking to integrate Qunt Edge analytics into their custom workflows.
            </p>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </span>
          </UnifiedSurface>
        </div>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
