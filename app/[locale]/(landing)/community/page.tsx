import type { Metadata } from 'next'
import { getPosts } from '@/app/[locale]/(landing)/actions/community'
import { PostList } from './components/post-list'
import { CreatePost } from './components/create-post'
import { ButtonV2 as Button } from '@/components/ui/v2'
import { Plus } from 'lucide-react'
import { getI18n } from '@/locales/server'
import { MarketingSection, MarketingSectionHeader } from '@/components/layout/marketing-sections'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/community',
    title: 'Community | Qunt Edge',
    description: 'Join the Qunt Edge community of traders.',
  })
}

export default async function CommunityPage() {
  const t = await getI18n()
  const posts = await getPosts()
  return (
    <MarketingSection className="pt-24 lg:pt-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <MarketingSectionHeader
          eyebrow="Community"
          title={t('community.title')}
          titleAs="h1"
          description={t('community.description')}
          align="left"
          className="m-0"
        />
        <CreatePost>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('community.newPost')}
          </Button>
        </CreatePost>
      </div>
      <div className="mt-12">
        <PostList initialPosts={posts} />
      </div>
    </MarketingSection>
  )
}
