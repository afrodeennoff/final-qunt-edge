import { describe, it, expect } from 'vitest'
import { faqCategories, getFaqItems } from '@/lib/faq-data'

describe('faq-data', () => {
  it('has the exact required categories', () => {
    expect(faqCategories).toEqual([
      'Getting Started',
      'Trading & Data Import',
      'Analytics & Features',
      'Teams & Collaboration',
      'Billing, Pricing & Plans',
      'Security, Privacy & Support',
    ])
  })
  it('returns 15 faq items', () => {
    expect(getFaqItems().length).toBe(15)
  })
  it('every item uses a valid category', () => {
    const valid = new Set(faqCategories)
    getFaqItems().forEach((item) => {
      expect(valid.has(item.category)).toBe(true)
    })
  })
})
