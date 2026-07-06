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
  const t = await getI18n()
  const posts = await getBlogPosts(true)

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Blog</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('blogs.title')}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('blogs.description')}
          </p>
        </header>
        <BlogList initialPosts={posts} />
      </div>
    </div>
  )
}
