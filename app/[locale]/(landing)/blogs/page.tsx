import { getBlogPosts } from '@/app/[locale]/admin/actions/blog-actions'
import { BlogList } from './components/blog-list'
import { getI18n } from '@/locales/server'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'
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
    <MarketingSection className="pt-24 lg:pt-32">
      <MarketingSectionHeader
        eyebrow="Blog"
        title={t('blogs.title')}
        titleAs="h1"
        description={t('blogs.description')}
      />
      <BlogList initialPosts={posts} />
    </MarketingSection>
  )
}
