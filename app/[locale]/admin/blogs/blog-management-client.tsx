'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, Edit, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BlogCategory, BlogPost } from '@/prisma/generated/prisma'

interface BlogManagementClientProps {
  initialPosts: Array<BlogPost & { author: { id: string; email: string } }>
  locale: string
  onDelete: (formData: FormData) => void
  onTogglePublish: (formData: FormData) => void
}

const categoryLabels: Record<BlogCategory, string> = {
  TRADING_TIPS: 'Trading Tips',
  MARKET_ANALYSIS: 'Market Analysis',
  PSYCHOLOGY: 'Psychology',
  RISK_MANAGEMENT: 'Risk Management',
  PLATFORM_UPDATES: 'Platform Updates',
}

const categoryBadgeVariants: Record<BlogCategory, 'default' | 'secondary' | 'outline' | 'accent' | 'success' | 'warning' | 'error'> = {
  TRADING_TIPS: 'accent',
  MARKET_ANALYSIS: 'default',
  PSYCHOLOGY: 'secondary',
  PLATFORM_UPDATES: 'success',
  RISK_MANAGEMENT: 'warning',
}

export function BlogManagementClient({
  initialPosts,
  locale,
  onDelete,
  onTogglePublish,
}: BlogManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredPosts = initialPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }
    const formData = new FormData()
    formData.append('id', id)
    formData.append('locale', locale)
    startTransition(() => {
      onDelete(formData)
    })
  }

  const handleTogglePublish = (id: string) => {
    const formData = new FormData()
    formData.append('id', id)
    formData.append('locale', locale)
    startTransition(() => {
      onTogglePublish(formData)
    })
  }

  return (
    <>
      <Card variant="flat" hover>
        <div className="border-b-0 p-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {filteredPosts.length === 0 ? (
        <Card variant="flat">
          <div className="py-12 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No blog posts match your search.' : 'No blog posts yet. Create your first post to get started.'}
          </div>
        </Card>
      ) : (
        <Card variant="flat" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                 <tr className="border-b-0 bg-gradient-to-br from-card/40 to-card/10 backdrop-blur-sm text-left text-xs sm:text-sm">
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Title</th>
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Slug</th>
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Category</th>
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Author</th>
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Status</th>
                  <th   className="p-2.5 sm:p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-2.5 sm:p-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b-0 last:border-0 hover:bg-primary/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{post.title}</div>
                      {post.excerpt && (
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {post.excerpt}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <code className="rounded bg-background/0.45 px-2 py-1 text-xs text-muted-foreground">
                        {post.slug}
                      </code>
                    </td>
                    <td className="p-4">
                      <Badge variant={categoryBadgeVariants[post.category]} size="sm">
                        {categoryLabels[post.category]}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{post.author.email}</td>
                    <td className="p-4">
                      <Badge variant={post.published ? 'success' : 'secondary'} size="sm">
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={() => handleTogglePublish(post.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            title={post.published ? 'Unpublish' : 'Publish'}
                            disabled={isPending}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </form>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/blogs/${post.id}/edit`} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          disabled={isPending}
                          onClick={() => handleDelete(post.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
