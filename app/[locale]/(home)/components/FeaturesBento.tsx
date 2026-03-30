'use client'

import { motion } from 'framer-motion'
import { BarChart3, Brain, Users, Download, FileText, Shield } from 'lucide-react'

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
      delay: i * 0.06,
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
      className={`
        group rounded-2xl border p-6 lg:p-7 transition-all duration-300
        ${feature.colSpan}
        ${
          feature.highlight
            ? 'border-primary/25 bg-primary/[0.04] shadow-[0_0_32px_-12px_hsl(var(--primary)/0.12)] hover:border-primary/40'
            : 'border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface)/0.5)] hover:border-[hsl(var(--mk-border)/0.5)] hover:bg-[hsl(var(--mk-surface)/0.7)]'
        }
      `}
    >
      <div className="mb-4">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-200
            ${
              feature.highlight
                ? 'bg-primary/10 border-primary/25'
                : 'bg-[hsl(var(--mk-surface-muted)/0.5)] border-[hsl(var(--mk-border)/0.3)] group-hover:bg-[hsl(var(--mk-surface-muted)/0.8)]'
            }
          `}
        >
          <Icon
            className={`w-4.5 h-4.5 ${
              feature.highlight ? 'text-primary' : 'text-muted-foreground/70'
            }`}
          />
        </div>
      </div>
      <h3
        className={`text-[1.02rem] font-semibold text-foreground mb-2 tracking-[-0.01em] [font-family:var(--home-display)] ${
          feature.highlight ? 'text-primary' : ''
        }`}
      >
        {feature.title}
      </h3>
      <p className="text-[0.88rem] text-muted-foreground/70 leading-relaxed [font-family:var(--home-copy)]">
        {feature.description}
      </p>
    </motion.div>
  )
}

export default function FeaturesBento() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
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
