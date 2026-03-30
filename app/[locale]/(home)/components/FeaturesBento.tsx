'use client'

import { motion } from 'framer-motion'
import { BarChart3, Brain, Users, Download, FileText, Shield } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Deep dive into your performance with decile analysis, heatmaps, and custom metrics.',
    colSpan: 'lg:col-span-2',
    highlight: false,
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description:
      'Pattern recognition and behavioral analysis powered by machine learning.',
    colSpan: 'lg:col-span-2',
    highlight: true,
  },
  {
    icon: Users,
    title: 'Team Sync',
    description: 'Share layouts, compare performance, and learn from your peers.',
    colSpan: 'lg:col-span-1',
    highlight: false,
  },
  {
    icon: Download,
    title: 'Multi-Broker Import',
    description:
      'Connect Tradovate, Rithmic, IBKR, or import from CSV. Your data, your way.',
    colSpan: 'lg:col-span-3',
    highlight: false,
  },
  {
    icon: FileText,
    title: 'Coach-Ready Exports',
    description:
      'Generate PDF briefs and shareable reports for mentorship sessions.',
    colSpan: 'lg:col-span-2',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade encryption and SOC2 compliance protect your data.',
    colSpan: 'lg:col-span-2',
    highlight: false,
  },
] as const

type Feature = (typeof features)[number]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={feature.colSpan}
    >
      <GlassCard
        variant="strong"
        hover={true}
        size="md"
        className="relative overflow-hidden h-full"
      >
        <div className="mb-4">
          <div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12">
            <div className="absolute inset-0 rounded-xl bg-[oklch(0.55_0.22_264/0.15)] blur-sm" />
            <div className="relative inline-flex items-center justify-center rounded-xl w-12 h-12 border border-[oklch(0.55_0.22_264/0.4)] bg-[oklch(0.55_0.22_264/0.1)]">
              <Icon className="w-5 h-5 text-[oklch(0.55_0.22_264)]" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gradient-primary">
          {feature.title}
        </h3>
        <p className="text-[0.88rem] text-muted-foreground/70 leading-relaxed [font-family:var(--home-copy)]">
          {feature.description}
        </p>
      </GlassCard>
    </motion.div>
  )
}

export default function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[clamp(1.8rem,3.8vw,2.75rem)] font-semibold tracking-[-0.025em] mb-5 text-foreground leading-tight [font-family:var(--home-display)]">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              trade smarter
            </span>
          </h2>
          <p className="text-[0.95rem] sm:text-lg text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Powerful analytics, AI insights, and team collaboration in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
