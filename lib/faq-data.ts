export type FaqItem = {
  id: string
  category: string
  question: string
  answer: string
}

export const faqCategories = [
  'Getting Started',
  'Trading & Data Import',
  'Analytics & Features',
  'Teams & Collaboration',
  'Billing/Pricing/Plans',
  'Security/Privacy/Support',
] as const

export type FaqCategory = (typeof faqCategories)[number]

const faqData: readonly FaqItem[] = [
  {
    id: 'different-from-traditional-journals',
    category: 'Getting Started',
    question: 'What makes Qunt Edge different from traditional journals?',
    answer:
      'Traditional journals focus on PnL, a lagging indicator. Qunt Edge audits execution decisions and the behavior between chart read and trade entry, helping you build repeatable processes that prop firms value.',
  },
  {
    id: 'time-to-first-import',
    category: 'Getting Started',
    question: 'How long does it take to get my first trade imported and analyzed?',
    answer:
      'Most traders connect their broker and see their first analyzed trades in under 5 minutes. Our guided import flows for Tradovate, Rithmic, and CSV uploads get you reviewing performance instantly.',
  },
  {
    id: 'prop-vs-retail',
    category: 'Getting Started',
    question: 'Is Qunt Edge only for prop traders or can retail traders use it too?',
    answer:
      'Built specifically for prop firm traders who need audit-grade execution tracking and consistency scoring, but any discretionary trader serious about improving their process will benefit from the same tools.',
  },
  {
    id: 'supported-brokers',
    category: 'Trading & Data Import',
    question: 'Which brokers and platforms does Qunt Edge support?',
    answer:
      'Direct sync with Tradovate, Rithmic, Interactive Brokers, and CQG. We also support CSV and PDF imports from nearly any broker or platform, with new connectors added based on user demand.',
  },
  {
    id: 'tradovate-vs-rithmic-sync',
    category: 'Trading & Data Import',
    question: 'How does auto-sync work with Tradovate versus Rithmic?',
    answer:
      'Tradovate uses secure OAuth so trades back up daily even when you are offline. Rithmic requires a lightweight local sync engine (no credentials stored in cloud) that only runs when you explicitly connect.',
  },
  {
    id: 'edit-imported-trades',
    category: 'Trading & Data Import',
    question: 'Can I correct or edit imported trades after the fact?',
    answer:
      'Yes. You can edit any field, split partial fills, add notes, tags, and screenshots. All changes are versioned so your analytics always reflect the most accurate picture of your execution.',
  },
  {
    id: 'multiple-accounts',
    category: 'Trading & Data Import',
    question: 'What if I trade on multiple accounts or platforms?',
    answer:
      'Link unlimited accounts and platforms. Qunt Edge unifies everything into a single performance view with per-account breakdowns and cross-account behavior patterns.',
  },
  {
    id: 'behavior-analysis-value',
    category: 'Analytics & Features',
    question: 'How does the behavior analysis actually help me trade better?',
    answer:
      'We surface patterns like hesitation time, overtrading after losses, and setup adherence rates. Prop traders use these to pass evaluations and maintain consistency once funded.',
  },
  {
    id: 'prop-firm-drawdown-tracking',
    category: 'Analytics & Features',
    question: 'Do you track prop-firm specific risk rules like daily drawdown?',
    answer:
      'Yes. Set your firm rules once and get real-time alerts and post-session reports showing exactly where you stayed compliant or breached limits.',
  },
  {
    id: 'ai-trade-review',
    category: 'Analytics & Features',
    question: 'Is there AI review of my trades?',
    answer:
      'Pro plans include AI-powered trade debriefs that analyze your decision process, emotional state indicators from timing data, and suggest concrete process improvements.',
  },
  {
    id: 'team-collaboration',
    category: 'Teams & Collaboration',
    question: 'Can my entire prop trading team share one workspace?',
    answer:
      'Team plans let managers invite traders, set roles, and review individual and group performance dashboards. Coaches see execution quality across the book without logging into each account.',
  },
  {
    id: 'share-performance-reports',
    category: 'Teams & Collaboration',
    question: 'How do I share my performance with a prop firm or mentor?',
    answer:
      'Generate shareable, read-only performance reports and behavior scorecards with one click. No data export needed; links expire or stay permanent based on your preference.',
  },
  {
    id: 'basic-vs-pro',
    category: 'Billing/Pricing/Plans',
    question: "What's the difference between Basic and Pro?",
    answer:
      'Basic gives you 30 days of history and core analytics. Pro unlocks unlimited history, AI debriefs, advanced behavior metrics, CSV exports, and priority support.',
  },
  {
    id: 'cancel-or-change-plans',
    category: 'Billing/Pricing/Plans',
    question: 'Can I cancel or change plans at any time?',
    answer:
      'Yes. Upgrade or downgrade instantly. When you downgrade, older data remains accessible in read-only mode for 90 days so you never lose your trading history.',
  },
  {
    id: 'data-security',
    category: 'Security/Privacy/Support',
    question: 'How secure is my trading data?',
    answer:
      'All data is encrypted at rest and in transit. We never share individual trade data with third parties. Sync credentials for non-OAuth brokers stay only on your machine.',
  },
  {
    id: 'import-help',
    category: 'Security/Privacy/Support',
    question: 'What if I need help importing a complex statement?',
    answer:
      'Our support team specializes in trading data. Open a ticket from inside the app and we typically resolve custom import issues within one business day.',
  },
  {
    id: 'gdpr-deletion',
    category: 'Security/Privacy/Support',
    question: 'Do you comply with GDPR and data deletion requests?',
    answer:
      'Yes. You can export or permanently delete all your data at any time from account settings. We honor deletion requests within 30 days as required.',
  },
]

export function getFaqItems(): FaqItem[] {
  return [...faqData]
}

export function getFaqCategories(): readonly FaqCategory[] {
  return faqCategories
}
