import { getBlogPosts } from '@/app/[locale]/admin/actions/blog-actions'
import { BlogList } from './components/blog-list'
import { getI18n } from '@/locales/server'
import type { Metadata } from 'next'
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
    path: '/blogs',
    title: 'Trading Journal Blog & Guides | Qunt Edge',
    description:
      'Expert insights, workflow guides, and trading-performance analysis from the Qunt Edge team.',
  })
}

export default async function BlogsPage() {
  const [t, posts] = await Promise.all([
    getI18n(),
    getBlogPosts(true)
  ])

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface className="space-y-6">
        <header className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Blog</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('blogs.title')}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            {t('blogs.description')}
          </p>
        </header>
        <BlogList initialPosts={posts} />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
