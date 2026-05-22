import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Code, GraduationCap, LineChart } from 'lucide-react'
import { ButtonV2 as Button, BadgeV2 as Badge } from '@/components/ui/v2'
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
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-xl border border-border bg-muted/20 p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">About Qunt Edge</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Built for serious discretionary traders who want better decision quality, tighter risk control, and repeatable performance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/pricing`} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            View Pricing
          </Link>
          <Link href={`/${locale}/support`} className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:bg-accent/50">
            Contact Support
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {storyCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-border bg-muted/20 p-6">
            <div className="mb-3 text-primary">{card.icon}</div>
            <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
          </div>
        ))}

        <div className="rounded-xl border border-border bg-muted/20 p-6 md:col-span-2">
          <h3 className="text-xl font-semibold text-foreground">Founder&apos;s Expertise</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {founderSkills.map((skill) => (
              <Badge key={skill.name} variant="secondary" className="flex items-center gap-1 border-border bg-muted/20 px-2 py-1 text-sm">
                {skill.icon}
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-6 md:col-span-2">
          <h3 className="text-xl font-semibold text-foreground">Why Qunt Edge?</h3>
          <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
            <li>Built by a trader, for traders</li>
            <li>Advanced analytics powered by real-world trading experience</li>
            <li>Comprehensive backtesting using your actual trade history</li>
            <li>AI-driven insights to improve your trading psychology</li>
            <li>Tailored to serious traders looking to elevate their performance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
