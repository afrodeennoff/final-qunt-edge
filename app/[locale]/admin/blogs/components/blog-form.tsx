'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { createBlogPost, updateBlogPost } from '../../actions/blog-actions'
import { BlogCategory } from '@/prisma/generated/prisma'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: BlogCategory
  published: boolean
}

type FormData = {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: BlogCategory
  published: boolean
}

const EXCERPT_MAX_LENGTH = 200

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const categoryOptions: { value: BlogCategory; label: string }[] = [
  { value: 'TRADING_TIPS', label: 'Trading Tips' },
  { value: 'MARKET_ANALYSIS', label: 'Market Analysis' },
  { value: 'PSYCHOLOGY', label: 'Psychology' },
  { value: 'RISK_MANAGEMENT', label: 'Risk Management' },
  { value: 'PLATFORM_UPDATES', label: 'Platform Updates' },
]

type Props = {
  post?: BlogPost
  locale: string
}

export function BlogForm({ post, locale }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!post

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      content: post?.content ?? '',
      coverImage: post?.coverImage ?? '',
      category: post?.category ?? 'TRADING_TIPS',
      published: post?.published ?? false,
    },
  })

  const excerptValue = watch('excerpt')
  const isPublished = watch('published')

  const autoGenerateSlug = (title: string) => {
    if (!isEditMode && title) {
      setValue('slug', slugify(title))
    }
  }

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateBlogPost(post.id, data)
          toast.success('Blog post updated successfully')
        } else {
          await createBlogPost(data)
          toast.success('Blog post created successfully')
        }
        router.push(`/${locale}/admin/blogs`)
      } catch {
        toast.error(isEditMode ? 'Failed to update blog post' : 'Failed to create blog post')
      }
    })
  }

  const handleCancel = () => {
    router.push(`/${locale}/admin/blogs`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter blog post title"
          onChange={(e) => {
            register('title').onChange(e)
            autoGenerateSlug(e.target.value)
          }}
          error={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          {...register('slug', { required: 'Slug is required' })}
          placeholder="blog-post-slug"
          error={!!errors.slug}
        />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Badge variant="secondary" className="text-xs">
            {excerptValue.length} / {EXCERPT_MAX_LENGTH}
          </Badge>
        </div>
        <Textarea
          id="excerpt"
          {...register('excerpt', {
            required: 'Excerpt is required',
            maxLength: {
              value: EXCERPT_MAX_LENGTH,
              message: `Excerpt must not exceed ${EXCERPT_MAX_LENGTH} characters`,
            },
          })}
          rows={3}
          placeholder="Brief summary of the blog post"
          error={!!errors.excerpt}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          {...register('coverImage')}
          type="url"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          {...register('category', { required: 'Category is required' })}
          className="flex h-10 w-full rounded-v2-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          rows={15}
          placeholder="Blog post content (HTML or plain text)"
          error={!!errors.content}
          className="font-mono text-sm"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          {...register('published')}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="published" className="font-normal cursor-pointer">
          Published
        </Label>
        {isPublished && (
          <Badge variant="default" className="ml-2">
            Visible
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
}
