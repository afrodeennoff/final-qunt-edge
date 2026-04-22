'use client'

import { BlogCategory } from '@/prisma/generated/prisma'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { useCurrentLocale } from '@/locales/client'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

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
  [BlogCategory.TRADING_TIPS]: 'bg-accent/10 text-accent border-accent/30',
  [BlogCategory.MARKET_ANALYSIS]: 'bg-primary/10 text-primary border-primary/30',
  [BlogCategory.PSYCHOLOGY]: 'bg-secondary/50 text-secondary-foreground border-secondary/30',
  [BlogCategory.RISK_MANAGEMENT]: 'bg-destructive/10 text-destructive border-destructive/30',
  [BlogCategory.PLATFORM_UPDATES]: 'bg-muted/50 text-muted-foreground border-border/30',
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
    <Link href={`/${locale}/blogs/${post.slug}`} className="group">
      <Card variant="default" className="h-full overflow-hidden transition-[opacity,background-color,border-color,transform] hover:border-primary/30">
        {post.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div>
            <Badge variant="outline" className={categoryColors[post.category]}>
              {categoryLabels[post.category]}
            </Badge>
          </div>
          <h3 className="font-semibold line-clamp-2 text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <span className="truncate max-w-[150px]">{post.author.email}</span>
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(post.createdAt), { locale: dateLocale, addSuffix: true })}
            </span>
          </div>
          <div className="text-sm font-medium text-primary group-hover:underline">
            Read More →
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
