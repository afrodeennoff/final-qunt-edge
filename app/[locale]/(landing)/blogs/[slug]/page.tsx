import { getBlogPostBySlug } from '@/app/[locale]/admin/actions/blog-actions'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import { BadgeV2 } from '@/components/ui/v2/badge-v2'
import { ButtonV2 } from '@/components/ui/v2/button-v2'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{
    locale: string
    slug: string
  }>
}

const categoryLabels: Record<string, string> = {
  TRADING_TIPS: 'Trading Tips',
  MARKET_ANALYSIS: 'Market Analysis',
  PSYCHOLOGY: 'Psychology',
  RISK_MANAGEMENT: 'Risk Management',
  PLATFORM_UPDATES: 'Platform Updates',
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)

  if (!post || !post.published) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: `${post.title} | Qunt Edge Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function BlogDetailPage(props: Props) {
  const params = await props.params
  const post = await getBlogPostBySlug(params.slug)

  if (!post || !post.published) {
    notFound()
  }

  const categoryLabel = categoryLabels[post.category] || post.category

  return (
    <UnifiedPageShell widthClassName="max-w-[800px]">
      <div className="space-y-8">
        <Link href="/blogs">
          <ButtonV2 variant="ghost" size="sm">
            ← Back to Blogs
          </ButtonV2>
        </Link>

        {post.coverImage && (
          <div className="relative w-full overflow-hidden rounded-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="max-h-[400px] w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <BadgeV2 variant="accent" size="md">
            {categoryLabel}
          </BadgeV2>

          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{post.author.email}</span>
            <span>·</span>
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>

        <div className="prose max-w-none">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}
        </div>
      </div>
    </UnifiedPageShell>
  )
}
