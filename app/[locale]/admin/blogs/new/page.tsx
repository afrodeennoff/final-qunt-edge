import { redirect } from 'next/navigation'
import Link from 'next/link'
import { assertAdminAccess } from '@/server/authz'
import { BlogForm } from '@/app/[locale]/admin/blogs/components/blog-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  await params
  return {
    title: 'New Blog Post',
  }
}

export default async function NewBlogPostPage({ params }: PageProps) {
  const { locale } = await params

  try {
    await assertAdminAccess()
  } catch {
    redirect(`/${locale}/authentication`)
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
          <h1 className="text-2xl font-semibold tracking-tight">New Blog Post</h1>
          <p className="text-sm text-muted-foreground">
            Create a new blog post for the Qunt Edge trading platform.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.6] bg-white/[0.070] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
        <BlogForm locale={locale} />
      </div>
    </div>
  )
}
