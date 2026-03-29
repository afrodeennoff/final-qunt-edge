import type { Metadata } from 'next'
import type { FaqItem } from './types'
import { buildFaqPageSchema, buildPublicMetadata, getCanonicalUrl } from '@/lib/seo'

const PAGE_PATH = '/prop-firm-deals'

export const PROP_FIRM_DEALS_LAST_UPDATED = 'March 13, 2026'
export const PROP_FIRM_DEALS_TITLE = 'Prop Firm Deals & Comparison | Qunt Edge'
export const PROP_FIRM_DEALS_DESCRIPTION =
  'Browse verified discount codes, compare prop firms side by side, and access trader tools in one Qunt Edge workspace.'

export function buildPropFirmDealsCanonical(locale: string): string {
  return getCanonicalUrl(locale, PAGE_PATH)
}

export function buildPropFirmDealsMetadata(locale: string): Metadata {
  return buildPublicMetadata({
    locale,
    path: PAGE_PATH,
    title: PROP_FIRM_DEALS_TITLE,
    description: PROP_FIRM_DEALS_DESCRIPTION,
  });
}

export function buildPropFirmDealsFaqSchema(faqs: readonly FaqItem[]) {
  return buildFaqPageSchema(faqs)
}
