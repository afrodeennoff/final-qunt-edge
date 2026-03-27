'use client'

import { BarChart3, Brain, Users, Download, FileText, Shield } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep dive into your performance with decile analysis, heatmaps, and custom metrics.',
    highlight: false,
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Pattern recognition and behavioral analysis powered by machine learning.',
    highlight: true,
  },
  {
    icon: Users,
    title: 'Team Sync',
    description: 'Share layouts, compare performance, and learn from your peers.',
    highlight: false,
  },
  {
    icon: Download,
    title: 'Multi-Broker Import',
    description: 'Connect Tradovate, Rithmic, IBKR, or import from CSV. Your data, your way.',
    highlight: false,
  },
  {
    icon: FileText,
    title: 'Coach-Ready Exports',
    description: 'Generate PDF briefs and shareable reports for mentorship sessions.',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and SOC2 compliance protect your data.',
    highlight: false,
  },
]

export default function Features() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.025em] mb-5 text-foreground leading-tight">
            Everything you need to{' '}
            <span className="text-gradient-primary">trade smarter</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Powerful analytics, AI insights, and team collaboration in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 stagger-reveal">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = index === 0 || index === 3
            
            return (
              <div
                key={feature.title}
                className={`
                  bento-card rounded-2xl border bg-card/50 p-6 lg:p-7
                  ${isLarge ? 'lg:col-span-2' : ''}
                  ${feature.highlight
                    ? 'border-primary/25 shadow-[0_0_32px_-12px_hsl(var(--primary)/0.15)]'
                    : 'border-border/50'}
                `}
              >
                <div className="mb-5">
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-200
                    ${feature.highlight
                      ? 'bg-primary/10 border-primary/25'
                      : 'bg-input/60 border-border/50'}
                  `}>
                    <Icon className={`
                      w-5 h-5
                      ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}
                    `} />
                  </div>
                </div>

                <h3 className="text-[1.05rem] font-semibold text-foreground mb-2 tracking-[-0.01em]">
                  {feature.title}
                </h3>

                <p className="text-[0.9rem] text-muted-foreground/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
