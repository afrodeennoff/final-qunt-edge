'use server'

import { prisma } from '@/lib/prisma'
import { createClient, getDatabaseUserId } from '@/server/auth'
import { assertAdminAccess } from '@/server/authz'
import { revalidatePath } from 'next/cache'
import { cacheLife, cacheTag, updateTag } from 'next/cache'
import { BlogCategory } from '@/prisma/generated/prisma'
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function requireAdminActor() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')
  await assertAdminAccess()
  const databaseUserId = await getDatabaseUserId()
  return { authUser: user, databaseUserId }
}

type CreateBlogPostData = {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  category: BlogCategory
  published: boolean
}

type UpdateBlogPostData = Partial<CreateBlogPostData>

export async function getBlogPosts(publishedOnly = true) {
  'use cache'
  cacheLife({ stale: 600, revalidate: 600, expire: 3600 })
  cacheTag('blog-posts')
  try {
    const posts = await prisma.blogPost.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return posts
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}

export async function getAllBlogPostsForAdmin() {
  await requireAdminActor()
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return posts
  } catch (error) {
    console.error('Failed to fetch blog posts for admin:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string) {
  'use cache'
  cacheLife({ stale: 600, revalidate: 600, expire: 3600 })
  cacheTag('blog-posts', `blog-post-${slug}`)
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    return post
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

export async function getBlogPost(id: string) {
  await requireAdminActor()
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    return post
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

export async function createBlogPost(data: CreateBlogPostData) {
  const { databaseUserId } = await requireAdminActor()
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title),
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        category: data.category,
        published: data.published,
        authorId: databaseUserId,
      },
    })
    revalidatePath('/blogs', 'page')
    revalidatePath('/blogs/[slug]', 'page')
    revalidatePath('/admin/blogs', 'page')
    updateTag('blog-posts')
    return { post }
  } catch (error) {
    console.error('Failed to create blog post:', error)
    throw new Error('Failed to create blog post')
  }
}

export async function updateBlogPost(id: string, data: UpdateBlogPostData) {
  await requireAdminActor()
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.published !== undefined && { published: data.published }),
      },
    })
    revalidatePath('/blogs', 'page')
    revalidatePath('/blogs/[slug]', 'page')
    revalidatePath('/admin/blogs', 'page')
    updateTag('blog-posts')
    return { post }
  } catch (error) {
    console.error('Failed to update blog post:', error)
    throw new Error('Failed to update blog post')
  }
}

export async function deleteBlogPost(id: string) {
  await requireAdminActor()
  try {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath('/blogs', 'page')
    revalidatePath('/blogs/[slug]', 'page')
    revalidatePath('/admin/blogs', 'page')
    updateTag('blog-posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete blog post:', error)
    throw new Error('Failed to delete blog post')
  }
}

export async function togglePublish(id: string) {
  await requireAdminActor()
  try {
    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) throw new Error('Post not found')
    await prisma.blogPost.update({
      where: { id },
      data: { published: !post.published },
    })
    revalidatePath('/blogs', 'page')
    revalidatePath('/blogs/[slug]', 'page')
    revalidatePath('/admin/blogs', 'page')
    updateTag('blog-posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle publish:', error)
    throw new Error('Failed to toggle publish status')
  }
}
