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
      <div className="flex flex-col gap-3 border-b border-border/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/admin/blogs`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">New Blog Post</h1>
            <p className="text-sm text-muted-foreground">
              Create a new blog post for the Qunt Edge trading platform.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/30 bg-background/40 p-5 shadow-[inset_0_1px_0_hsl(var(--primary)/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
        <BlogForm locale={locale} />
      </div>
    </div>
  )
}
