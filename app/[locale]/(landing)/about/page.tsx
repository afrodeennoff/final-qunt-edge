import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Code, GraduationCap, LineChart } from 'lucide-react'
import { ButtonV2 as Button, BadgeV2 as Badge } from '@/components/ui/v2'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
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
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <UnifiedSurface className="space-y-8">
        <header className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">About Us</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            About Qunt Edge
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Built for serious discretionary traders who want better decision quality, tighter risk control, and repeatable performance.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            >
              View Pricing
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex items-center justify-center rounded-full border border-border/20 bg-gradient-to-br from-card/50 to-card/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-all hover:border-primary/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            >
              Contact Support
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {storyCards.map((card) => (
            <UnifiedSurface key={card.title} variant="subtle">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/20 bg-gradient-to-br from-muted/50 to-muted/20 text-foreground">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.description}</p>
            </UnifiedSurface>
          ))}

          <UnifiedSurface variant="subtle" className="md:col-span-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Founder&apos;s Expertise</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {founderSkills.map((skill) => (
                <Badge key={skill.name} variant="secondary" className="flex items-center gap-1 border-border/20 bg-muted/30 px-2.5 py-1 text-sm">
                  {skill.icon}
                  {skill.name}
                </Badge>
              ))}
            </div>
          </UnifiedSurface>

          <UnifiedSurface variant="subtle" className="md:col-span-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Why Qunt Edge?</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Built by a trader, for traders</li>
              <li>Advanced analytics powered by real-world trading experience</li>
              <li>Comprehensive backtesting using your actual trade history</li>
              <li>AI-driven insights to improve your trading psychology</li>
              <li>Tailored to serious traders looking to elevate their performance</li>
            </ul>
          </UnifiedSurface>
        </div>
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
