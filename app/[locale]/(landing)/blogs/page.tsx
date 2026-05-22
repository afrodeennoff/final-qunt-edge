import { getBlogPosts } from '@/app/[locale]/admin/actions/blog-actions'
import { BlogList } from './components/blog-list'
import { getI18n } from '@/locales/server'
import type { Metadata } from 'next'
import { buildPublicMetadata } from '@/lib/seo'

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
      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">{t('blogs.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('blogs.description')}</p>
        </div>
        <BlogList initialPosts={posts} />
      </div>
    </div>
  )
}
