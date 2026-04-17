import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { assertAdminAccess } from '@/server/authz'
import { getBlogPost } from '@/app/[locale]/admin/actions/blog-actions'
import { BlogForm } from '@/app/[locale]/admin/blogs/components/blog-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  await params
  return {
    title: 'Edit Blog Post',
  }
}

export default async function EditBlogPostPage({ params }: PageProps) {
  const { locale, id } = await params

  try {
    await assertAdminAccess()
  } catch {
    redirect(`/${locale}/authentication`)
  }

  const post = await getBlogPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/admin/blogs`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blogs
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Blog Post</h1>
          <p className="text-sm text-muted-foreground">
            Edit blog post: {post.title}
          </p>
        </div>
      </div>

<<<<<<< HEAD
      <div className="rounded-2xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.05)] p-6 shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
=======
      <div className="rounded-3xl border border-border/24 bg-card/70 p-6 shadow-sm backdrop-blur-sm">
>>>>>>> origin/main
        <BlogForm
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            category: post.category,
            published: post.published,
          }}
          locale={locale}
        />
      </div>
    </div>
  )
}
