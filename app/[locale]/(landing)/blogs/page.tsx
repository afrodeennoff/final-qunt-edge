import { getBlogPosts } from '@/app/[locale]/admin/actions/blog-actions'
import { BlogList } from './components/blog-list'
import { getI18n } from '@/locales/server'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export const metadata = {
  title: 'Blog | Qunt Edge',
  description: 'Expert insights, trading tips, and market analysis to help you become a better trader.',
}

export default async function BlogsPage() {
  const t = await getI18n()
  const posts = await getBlogPosts(true)

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">{t('blogs.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('blogs.description')}</p>
        </div>
        <BlogList initialPosts={posts} />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
