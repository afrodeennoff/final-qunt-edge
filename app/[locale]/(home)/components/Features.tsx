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
    <section className="py-24 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4 text-[#E0E0E0]">
            Everything you need to{' '}
            <span className="text-[#2962FF]">trade smarter</span>
          </h2>
          <p className="text-lg text-[#9E9E9E] max-w-2xl mx-auto">
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
                  bento-card rounded-xl border border-[#1A1A21] bg-[#0b0b0d] p-6
                  ${isLarge ? 'lg:col-span-2' : ''}
                  ${feature.highlight ? 'border-[#2962FF]/30' : ''}
                `}
              >
                <div className="mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center border
                    ${feature.highlight 
                      ? 'bg-[#2962FF]/10 border-[#2962FF]/30' 
                      : 'bg-[#101014] border-[#1A1A21]'}
                  `}>
                    <Icon className={`
                      w-6 h-6
                      ${feature.highlight ? 'text-[#2962FF]' : 'text-[#9E9E9E]'}
                    `} />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-[#E0E0E0] mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-[#707070]">
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
