'use client'

import { BlogCategory } from '@/prisma/generated/prisma'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { useCurrentLocale } from '@/locales/client'
import Link from 'next/link'
import Image from 'next/image'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  category: BlogCategory
  published: boolean
  createdAt: Date
  author: {
    email: string
  }
}

interface Props {
  post: BlogPost
}

const categoryColors: Record<BlogCategory, string> = {
  [BlogCategory.TRADING_TIPS]: 'bg-accent/10 text-accent',
  [BlogCategory.MARKET_ANALYSIS]: 'bg-primary/10 text-primary',
  [BlogCategory.PSYCHOLOGY]: 'bg-muted text-muted-foreground',
  [BlogCategory.RISK_MANAGEMENT]: 'bg-destructive/10 text-destructive',
  [BlogCategory.PLATFORM_UPDATES]: 'bg-muted/50 text-muted-foreground',
}

const categoryLabels: Record<BlogCategory, string> = {
  [BlogCategory.TRADING_TIPS]: 'Trading Tips',
  [BlogCategory.MARKET_ANALYSIS]: 'Market Analysis',
  [BlogCategory.PSYCHOLOGY]: 'Psychology',
  [BlogCategory.RISK_MANAGEMENT]: 'Risk Management',
  [BlogCategory.PLATFORM_UPDATES]: 'Platform Updates',
}

export function BlogCard({ post }: Props) {
  const locale = useCurrentLocale()
  const dateLocale = locale === 'fr' ? fr : enUS

  return (
    <Link href={`/${locale}/blogs/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-card transition-all duration-200 hover:ring-1 hover:ring-primary/20">
        {post.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-5">
          <Badge variant="default" className={categoryColors[post.category]}>
            {categoryLabels[post.category]}
          </Badge>
          <h3 className="mt-3 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-border/5 pt-3 text-xs text-muted-foreground">
            <span className="truncate max-w-[150px]">{post.author.email}</span>
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(post.createdAt), { locale: dateLocale, addSuffix: true })}
            </span>
          </div>
          <div className="mt-3 text-sm font-medium text-primary">
            Read More →
          </div>
        </div>
      </div>
    </Link>
  )
}
