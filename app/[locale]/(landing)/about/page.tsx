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
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <header className="mb-6 rounded-xl border border-border/30 bg-background/0.11 p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">About Qunt Edge</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Built for serious discretionary traders who want better decision quality, tighter risk control, and repeatable performance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/pricing`} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            View Pricing
          </Link>
          <Link href={`/${locale}/support`} className="rounded-full border border-border/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:bg-accent/50">
            Contact Support
          </Link>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border/30 bg-background/0.11">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At Qunt Edge, we&apos;re on a mission to empower traders with advanced analytics and AI-driven insights. 
              Our platform is designed to help you understand your trading patterns, optimize your strategies, 
              and ultimately become a better trader through comprehensive backtesting and analysis of your real track record.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-background/0.11">
          <CardHeader>
            <CardTitle className="text-2xl">THE TRADER BEHIND TIMON|</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              I&apos;m Timon - a futures trader and trading educator. After years of studying price action, market behavior, and trading psychology, I developed a structured approach focused on clarity, simplicity, and consistent execution.
            </p>
            <p className="text-muted-foreground">
              This method is built to help traders avoid common mistakes, reduce noise, and progress with better decision-making and discipline. The focus is straightforward: strategy, execution, and mindset. No distractions. Just a process designed to support steady improvement over time.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-background/0.11 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Founder&apos;s Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {founderSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="border-border/30 bg-secondary/30 text-sm py-1 px-2 flex items-center gap-1">
                  {skill.icon}
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-background/0.11 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Why Qunt Edge?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Built by a trader, for traders</li>
              <li>Advanced analytics powered by real-world trading experience</li>
              <li>Comprehensive backtesting using your actual trade history</li>
              <li>AI-driven insights to improve your trading psychology</li>
              <li>Tailored to serious traders looking to elevate their performance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </UnifiedPageShell>
  )
}
