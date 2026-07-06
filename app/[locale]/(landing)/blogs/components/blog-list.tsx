'use client'

import { useState } from 'react'
import { BlogCategory } from '@/prisma/generated/prisma'
import { BlogCard } from './blog-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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

type Props = {
  initialPosts: BlogPost[]
}

const categories: Array<{ value: BlogCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: BlogCategory.TRADING_TIPS, label: 'Trading Tips' },
  { value: BlogCategory.MARKET_ANALYSIS, label: 'Market Analysis' },
  { value: BlogCategory.PSYCHOLOGY, label: 'Psychology' },
  { value: BlogCategory.RISK_MANAGEMENT, label: 'Risk Management' },
  { value: BlogCategory.PLATFORM_UPDATES, label: 'Platform Updates' },
]

export function BlogList({ initialPosts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'ALL' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-[300px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === category.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-xl bg-muted/30 py-12 text-center">
          <p className="text-sm text-muted-foreground">No blog posts found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
