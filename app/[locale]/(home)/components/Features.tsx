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
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4 text-foreground">
            Everything you need to{' '}
            <span className="text-primary">trade smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful analytics, AI insights, and team collaboration in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-reveal">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = index === 0 || index === 3
            
            return (
              <div
                key={feature.title}
                className={`
                  bento-card rounded-xl border border-border bg-card p-6
                  ${isLarge ? 'lg:col-span-2' : ''}
                  ${feature.highlight ? 'border-primary/30' : ''}
                `}
              >
                <div className="mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center border
                    ${feature.highlight
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-input border-border'}
                  `}>
                    <Icon className={`
                      w-6 h-6
                      ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}
                    `} />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground">
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
