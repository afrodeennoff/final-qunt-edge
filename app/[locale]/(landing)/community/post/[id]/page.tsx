import { getPost, getComments } from '@/app/[locale]/(landing)/actions/community'
import { PostCard } from '../../components/post-card'
import { notFound } from 'next/navigation'
import { ExtendedPost } from '../../types'
import type { Metadata } from 'next'
import { buildPublicMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  try {
    const post = await getPost(id)
    if (!post) {
      return { title: 'Post Not Found | Qunt Edge' }
    }
    const title = post.title ? `${post.title} | Qunt Edge Community` : 'Community Post | Qunt Edge'
    const description = post.content
      ? post.content.slice(0, 160).replace(/[#*_\n]/g, ' ').trim()
      : 'Join the discussion on Qunt Edge community.'
    return buildPublicMetadata({ locale, path: `/community/post/${id}`, title, description })
  } catch {
    return { title: 'Community Post | Qunt Edge' }
  }
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  let postData: Awaited<ReturnType<typeof getPost>>
  let commentsData: Awaited<ReturnType<typeof getComments>>

  try {
    ;[postData, commentsData] = await Promise.all([
      getPost(params.id),
      getComments(params.id),
    ])
  } catch (error) {
    if (error instanceof Error && error.message === "__POST_NOT_FOUND__") {
      notFound()
    }
    notFound()
  }

  if (!postData) {
    notFound()
  }

  const extendedPost: ExtendedPost = {
    ...postData,
    _count: { comments: commentsData.length }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <PostCard
          post={extendedPost}
          isExpanded={true}
          isAuthor={extendedPost.isAuthor}
        />
      </div>
    </div>
  )
}
