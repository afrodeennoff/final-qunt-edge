import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllBlogPostsForAdmin, deleteBlogPost, togglePublish } from '@/app/[locale]/admin/actions/blog-actions'
import { assertAdminAccess } from '@/server/authz'
import { BlogManagementClient } from './blog-management-client'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  await params
  return {
    title: 'Blog Management',
  }
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id')
  if (!id || typeof id !== 'string') throw new Error('Missing post ID')
  const locale = formData.get('locale')
  if (!locale || typeof locale !== 'string') throw new Error('Missing locale')
  await deleteBlogPost(id)
  redirect(`/${locale}/admin/blogs`)
}

async function handleTogglePublish(formData: FormData) {
  'use server'
  const id = formData.get('id')
  if (!id || typeof id !== 'string') throw new Error('Missing post ID')
  const locale = formData.get('locale')
  if (!locale || typeof locale !== 'string') throw new Error('Missing locale')
  await togglePublish(id)
  redirect(`/${locale}/admin/blogs`)
}

export default async function AdminBlogsPage({ params }: PageProps) {
  const { locale } = await params

  try {
    await assertAdminAccess()
  } catch {
    redirect(`/${locale}/authentication`)
  }

  const posts = await getAllBlogPostsForAdmin()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[oklch(0.65_0.22_260/0.08)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
            Admin Content
          </p>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Blog Management</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create, edit, publish, and manage blog posts from one central admin workspace.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="solid" asChild>
            <Link href={`/${locale}/admin/blogs/new`}>
              <Plus className="h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      <BlogManagementClient
        initialPosts={posts}
        locale={locale}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />
    </div>
  )
}
