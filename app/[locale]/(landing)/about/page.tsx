import type { Metadata } from 'next'
import { BookOpen, Code, GraduationCap, LineChart } from 'lucide-react'
import { ButtonV2 as Button, BadgeV2 as Badge } from '@/components/ui/v2'
import {
  MarketingFeatureCard,
  MarketingSection,
  MarketingSectionHeader,
  marketingBodyClassName,
  marketingHeroTitleClassName,
} from '@/components/layout/marketing-sections'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    title: 'About Qunt Edge | Trading Performance Intelligence',
    description:
      'Learn how Qunt Edge helps discretionary traders improve execution quality, risk discipline, and decision consistency.',
    path: '/about',
    locale,
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const founderSkills = [
    { name: 'Order Book Trading', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Volume Profile', icon: <LineChart className="w-4 h-4" /> },
    { name: 'Computer Science', icon: <Code className="w-4 h-4" /> },
    { name: 'Quantitative Finance', icon: <GraduationCap className="w-4 h-4" /> },
  ]

  const storyCards = [
    {
      icon: <LineChart className="h-5 w-5" />,
      title: 'Our mission',
      description:
        'Help discretionary traders improve execution quality, risk discipline, and review consistency.',
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: 'Built by a trader',
      description:
        'Timon shaped Qunt Edge around clarity, repeatable review, and fewer distractions after the session.',
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: 'Structured analytics',
      description:
        'The platform turns real trade history into practical patterns across setups, timing, and behavior.',
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: 'Coach-ready workflow',
      description:
        'Teams and solo traders can review decisions with the same clean, consistent operating rhythm.',
    },
  ]

  return (
    <>
      <MarketingSection className="pt-24 text-center lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            About Qunt Edge
          </p>
          <h1 className={marketingHeroTitleClassName}>Built for cleaner review.</h1>
          <p className={`${marketingBodyClassName} mx-auto mt-5 max-w-2xl`}>
            Serious discretionary traders use Qunt Edge to convert execution history into a
            repeatable improvement loop.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <a href={`/${locale}/pricing`}>View pricing</a>
            </Button>
            <Button asChild variant="outline">
              <a href={`/${locale}/support`}>Contact support</a>
            </Button>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Operating belief"
          title="Less noise, better decisions."
          description="The product is built around the part of trading that compounds: objective review after every session."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {storyCards.map((card) => (
            <MarketingFeatureCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="pb-28">
        <MarketingSectionHeader
          eyebrow="Founder expertise"
          title="Trading context stays close."
          description="The brand system, analytics, and workflows are shaped around futures execution review."
        />
        <div className="flex flex-wrap justify-center gap-3">
          {founderSkills.map((skill) => (
            <Badge
              key={skill.name}
              variant="frost-info"
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              {skill.icon}
              {skill.name}
            </Badge>
          ))}
        </div>
      </MarketingSection>
    </>
  )
}
