'use client'

import { useState } from 'react'
import { BlogCategory } from '@/prisma/generated/prisma'
import { BlogCard } from './blog-card'
import { InputV2 } from '@/components/ui/v2'
import { ButtonV2 } from '@/components/ui/v2'
import { useI18n } from '@/locales/client'

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

export function BlogList({ initialPosts }: Props) {
  const t = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'ALL' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories: Array<{ value: BlogCategory | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: BlogCategory.TRADING_TIPS, label: 'Trading Tips' },
    { value: BlogCategory.MARKET_ANALYSIS, label: 'Market Analysis' },
    { value: BlogCategory.PSYCHOLOGY, label: 'Psychology' },
    { value: BlogCategory.RISK_MANAGEMENT, label: 'Risk Management' },
    { value: BlogCategory.PLATFORM_UPDATES, label: 'Platform Updates' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <InputV2
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-[300px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <ButtonV2
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className="rounded-xl"
          >
            {category.label}
          </ButtonV2>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No blog posts found</p>
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
