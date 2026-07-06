import { getBlogPostBySlug } from '@/app/[locale]/admin/actions/blog-actions'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getCanonicalUrl, getLocaleAlternates } from '@/lib/seo'
import { sanitizeHtml } from '@/lib/sanitize'
import { ArrowLeft } from 'lucide-react'

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
    <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Link
          href={`/${params.locale}/blogs`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        {post.coverImage && (
          <div className="relative w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
              className="max-h-[400px] w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <Badge variant="default" size="md">
            {categoryLabel}
          </Badge>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
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

        <div className="prose prose-sm max-w-none">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
