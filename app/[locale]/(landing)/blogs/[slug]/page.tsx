import { getBlogPostBySlug } from '@/app/[locale]/admin/actions/blog-actions'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getCanonicalUrl, getLocaleAlternates } from '@/lib/seo'

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
  const canonical = getCanonicalUrl(params.locale, `/blogs/${params.slug}`)

  return {
    title: `${post.title} | Qunt Edge Blog`,
    description: post.excerpt,
    alternates: getLocaleAlternates(params.locale, `/blogs/${params.slug}`),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
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
  const formatter = new Intl.DateTimeFormat(params.locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <UnifiedPageShell widthClassName="max-w-[800px]">
      <div className="space-y-8">
        <Link href={`/${params.locale}/blogs`}>
          <Button variant="ghost" size="sm">
            ← Back to Blogs
          </Button>
        </Link>

        {post.coverImage && (
          <div className="relative w-full overflow-hidden rounded-xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              unoptimized
              className="max-h-[400px] w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <Badge variant="default" size="md">
            {categoryLabel}
          </Badge>

          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{post.author.email}</span>
            <span>·</span>
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {formatter.format(new Date(post.createdAt))}
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
