'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import {
  DollarSign, ShoppingCart, Tag, Percent, Calculator, ArrowRight, Check,
  TrendingDown, Gift, Star, Award, Shield, Zap, Clock, Users, Search
} from 'lucide-react'

const cardMain = 'rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5 sm:p-6'
const cardNested = 'rounded-lg bg-[var(--qe-ref-surface-2)] p-4'
const eyebrowStyle = 'text-[11px] font-semibold tracking-[0.16em] text-[var(--qe-ref-green)] uppercase'
const headingCard = 'text-[17px] font-semibold tracking-[-0.01em]'
const bodySmall = 'text-[13px] leading-[1.55] text-[var(--qe-ref-text-muted)]'
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ')

export default function DocsDealsPage() {
  const locale = useCurrentLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Are all deals exclusive to Qunt Edge users?",
      a: "Many deals are exclusive partnerships negotiated with prop firms specifically for Qunt Edge users. Others are publicly available coupon codes. The marketplace clearly labels which is which. Exclusive deals are marked with an 'Exclusive' badge and typically offer better discounts than public codes."
    },
    {
      q: "How do I apply a coupon code to my challenge purchase?",
      a: "Each deal page has a 'Get Deal' button. Clicking it either reveals the coupon code (for public deals) or redirects you through an affiliate link that auto-applies the discount (for exclusive deals). The code/link is also emailed to you for later use."
    },
    {
      q: "Can I use multiple discount codes on one purchase?",
      a: "Prop firm policies vary — most allow only one discount per purchase. The deal calculator shows the best available price by applying the highest-value discount to the selected account size."
    },
    {
      q: "Do you track whether I actually purchase through a deal?",
      a: "We track conversion for partnership reporting purposes only. Your purchase data is never shared with other users. If you opt into the community stats, we may aggregate anonymous conversion rates (e.g., '23% of users who viewed this deal purchased')."
    },
  ]

  return (
    <div className="public-page space-y-10 text-[var(--qe-ref-text)]">
      {/* HERO */}
      <div>
        <div className={eyebrowStyle}>DEALS MARKETPLACE</div>
        <h1 className="ref-h-section mt-2 text-[var(--qe-ref-text)]">Challenge Deals & Discounts</h1>
        <p className="ref-body mt-3 max-w-[68ch] text-[var(--qe-ref-text-muted)]">
          Save money on prop firm challenges with real-time deals, exclusive partner discounts, and coupon codes. 
          The Deals Marketplace is the only place to compare prices across 30+ firms, see verified savings, and 
          use the built-in calculator to find the best value for your account size.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/deals`} className="ref-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-black">
            Browse Current Deals <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/docs/propfirms`} className="ref-cta-secondary inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[13px]">
            Prop Firm Catalogue
          </Link>
        </div>
      </div>

      {/* ON THIS PAGE */}
      <div className={cardMain}>
        <div className={eyebrowStyle}>ON THIS PAGE</div>
        <div className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            ['Current Hot Deals', '#hotdeals'],
            ['How the Marketplace Works', '#how'],
            ['Deal Calculator', '#calculator'],
            ['Compare Prices Across Firms', '#compare'],
            ['Exclusive vs Public Deals', '#types'],
            ['Coupon Code Management', '#coupons'],
            ['Savings Tracker', '#savings'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-[var(--qe-ref-text-muted)] hover:text-[var(--qe-ref-green)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>
      </div>

      {/* HOT DEALS */}
      <div id="hotdeals">
        <div className={eyebrowStyle}>FEATURED</div>
        <h2 className="ref-h-section mt-2">Current Hot Deals</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { firm: "FTMO", discount: "15% OFF", code: "QUNT15", original: "$495", final: "$420", expiry: "Jun 30", badge: "Exclusive" },
            { firm: "Topstep", discount: "20% OFF", code: "QUNT20", original: "$375", final: "$300", expiry: "Jul 15", badge: "Exclusive" },
            { firm: "E8 Markets", discount: "25% OFF", code: "E8QUNT25", original: "$299", final: "$224", expiry: "Jul 1", badge: "Best Value" },
            { firm: "TFT", discount: "10% OFF", code: "TFTQUNT", original: "$299", final: "$269", expiry: "Jun 25", badge: "Limited" },
            { firm: "Fidelcrest", discount: "30% OFF", code: "FCQUNT30", original: "$399", final: "$279", expiry: "Jul 31", badge: "Best Value" },
            { firm: "SurgeTrader", discount: "15% OFF", code: "SURGE15", original: "$349", final: "$297", expiry: "Jul 15", badge: "Exclusive" },
          ].map((d, i) => (
            <div key={i} className={cardMain}>
              <div className="flex items-center justify-between mb-2">
                <div className={headingCard}>{d.firm}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  d.badge === 'Exclusive' ? 'bg-purple-500/10 text-purple-400' :
                  d.badge === 'Best Value' ? 'bg-[var(--qe-ref-green)]/10 text-[var(--qe-ref-green)]' :
                  'bg-amber-500/10 text-amber-400'
                }`}>{d.badge}</span>
              </div>
              <div className="mt-2 text-xs">
                <div className="text-lg font-bold text-[var(--qe-ref-green)]">{d.discount}</div>
                <div className="mt-1 text-[var(--qe-ref-text-muted)]"><span className="line-through">{d.original}</span> → <span className="text-[var(--qe-ref-text)] font-semibold">{d.final}</span></div>
                <div className="mt-1 text-[var(--qe-ref-text-muted)]">Code: <span className="font-mono text-[var(--qe-ref-green)]">{d.code}</span></div>
                <div className="mt-2 text-[10px] text-[var(--qe-ref-text-muted)]">Expires: {d.expiry}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how">
        <div className={eyebrowStyle}>EXPLAINED</div>
        <h2 className="ref-h-section mt-2">How the Marketplace Works</h2>
        <div className="mt-4 space-y-4">
          <div className={cardMain}>
            <p className={bodySmall}>The Deals Marketplace aggregates all available prop firm challenge discounts — both exclusive Qunt Edge partner deals and public coupon codes — in one place. Here is how it works:</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-xs">
              {[
                { icon: Search, title: "Browse", desc: "Scroll through the deal grid or filter by firm, discount size, account size, or deal type (exclusive/public). Each deal shows the firm, discount percentage, coupon code, and expiry date." },
                { icon: Calculator, title: "Compare", desc: "Use the deal calculator to compare total cost across firms for your target account size. The calculator factors in the base price, discount, and any additional fees (refundable deposits, platform fees)." },
                { icon: ShoppingCart, title: "Buy", desc: "Click 'Get Deal' to reveal the coupon code or be redirected through an exclusive link. The code auto-copies to your clipboard. Complete the purchase on the prop firm's website with the discount applied." },
              ].map((s, i) => (
                <div key={i} className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="h-4 w-4 text-[var(--qe-ref-green)]" />
                    <span className="font-medium text-[var(--qe-ref-text)]">{s.title}</span>
                  </div>
                  <div className="text-[var(--qe-ref-text-muted)]">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-5">
            <div className="font-medium mb-2">Deal Lifecycle</div>
            <svg viewBox="0 0 780 50" className="w-full max-w-[700px]">
              <rect x="20" y="10" width="130" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
              <text x="85" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Firm negotiates deal</text>
              <line x1="155" y1="25" x2="185" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
              <polygon points="185,25 177,20 177,30" fill="var(--qe-ref-green)" />
              <rect x="190" y="10" width="130" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
              <text x="255" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Listed in Marketplace</text>
              <line x1="325" y1="25" x2="355" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
              <polygon points="355,25 347,20 347,30" fill="var(--qe-ref-green)" />
              <rect x="360" y="10" width="130" height="30" rx="6" fill="rgba(0,255,159,0.15)" stroke="var(--qe-ref-green)" />
              <text x="425" y="30" fill="var(--qe-ref-green)" fontSize="10" textAnchor="middle" fontWeight="600">User redeems code</text>
              <line x1="495" y1="25" x2="525" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
              <polygon points="525,25 517,20 517,30" fill="var(--qe-ref-green)" />
              <rect x="530" y="10" width="130" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
              <text x="595" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Purchase tracked</text>
              <line x1="665" y1="25" x2="695" y2="25" stroke="var(--qe-ref-green)" strokeWidth="2" />
              <polygon points="695,25 687,20 687,30" fill="var(--qe-ref-green)" />
              <rect x="700" y="10" width="60" height="30" rx="6" fill="rgba(0,255,159,0.1)" stroke="rgba(0,255,159,0.3)" />
              <text x="730" y="30" fill="var(--qe-ref-text)" fontSize="10" textAnchor="middle">Saved!</text>
            </svg>
          </div>
        </div>
      </div>

      {/* CALCULATOR */}
      <div id="calculator">
        <div className={eyebrowStyle}>SMART COMPARISON</div>
        <h2 className="ref-h-section mt-2">Deal Calculator</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Calculator className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Find the Best Value for Your Budget</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">The deal calculator helps you answer: "Which firm's challenge gives me the most funded capital for my money?"</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs">
                <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                  <div className="font-medium text-[var(--qe-ref-text)]">Step 1: Set Budget</div>
                  <div className="text-[var(--qe-ref-text-muted)] mt-1">Enter how much you want to spend on a challenge. The calculator shows all available options within your budget, sorted by best value.</div>
                </div>
                <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                  <div className="font-medium text-[var(--qe-ref-text)]">Step 2: Compare</div>
                  <div className="text-[var(--qe-ref-text-muted)] mt-1">See a cost-per-dollar-funded ratio across firms. A $500 challenge for a $100k account costs $0.005 per dollar funded. Lower ratio = better value.</div>
                </div>
                <div className="rounded-lg bg-[var(--qe-ref-surface-2)] p-3">
                  <div className="font-medium text-[var(--qe-ref-text)]">Step 3: Apply Deals</div>
                  <div className="text-[var(--qe-ref-text-muted)] mt-1">The calculator applies the best available deal for each firm automatically. Toggle deals on/off to see your actual savings vs retail price.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample calculation */}
        <div className="mt-4 rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface-2)] p-4">
          <div className="text-[10px] tracking-[2px] text-[var(--qe-ref-text-muted)] mb-3">EXAMPLE CALCULATION</div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full">
              <thead>
                <tr className="text-[var(--qe-ref-text-muted)] border-b border-[var(--qe-ref-card-border)]">
                  <th className="text-left py-2">Firm</th>
                  <th className="text-right py-2">Challenge Fee</th>
                  <th className="text-right py-2">Account Size</th>
                  <th className="text-right py-2">Discount</th>
                  <th className="text-right py-2">Final Price</th>
                  <th className="text-right py-2">Cost per $1k Funded</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { firm: "FTMO", fee: "$495", size: "$100k", discount: "15%", final: "$420", ratio: "$4.20" },
                  { firm: "Topstep", fee: "$375", size: "$100k", discount: "20%", final: "$300", ratio: "$3.00" },
                  { firm: "E8 Markets", fee: "$299", size: "$100k", discount: "25%", final: "$224", ratio: "$2.24" },
                  { firm: "Fidelcrest", fee: "$399", size: "$100k", discount: "30%", final: "$279", ratio: "$2.79" },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-[var(--qe-ref-card-border)] text-[var(--qe-ref-text)]">
                    <td className="py-2">{r.firm}</td>
                    <td className="text-right py-2 text-[var(--qe-ref-text-muted)]">{r.fee}</td>
                    <td className="text-right py-2">{r.size}</td>
                    <td className="text-right py-2 text-[var(--qe-ref-green)]">{r.discount}</td>
                    <td className="text-right py-2 font-semibold">{r.final}</td>
                    <td className="text-right py-2 font-semibold text-[var(--qe-ref-green)]">{r.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COMPARE */}
      <div id="compare">
        <div className={eyebrowStyle}>COMPARISON</div>
        <h2 className="ref-h-section mt-2">Compare Prices Across Firms</h2>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="headingCard">By Account Size</div>
            <p className={bodySmall + ' mt-2'}>Filter deals by target account size: $5k, $10k, $25k, $50k, $100k, $150k, $200k, $300k, $500k+. See which firms offer the best pricing for the specific account size you want.</p>
          </div>
          <div className={cardMain}>
            <div className="headingCard">By Challenge Type</div>
            <p className={bodySmall + ' mt-2'}>Compare deals for 1-phase challenges vs 2-phase challenges vs instant funding programs. Some firms specialize in one type and offer better discounts for it.</p>
          </div>
        </div>
      </div>

      {/* TYPES */}
      <div id="types">
        <div className={eyebrowStyle}>DEAL TYPES</div>
        <h2 className="ref-h-section mt-2">Exclusive vs Public Deals</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-purple-400" />
              <div className={headingCard}>Exclusive Qunt Edge Deals</div>
            </div>
            <p className={bodySmall}>Negotiated directly with prop firms for Qunt Edge users only. These codes are not available anywhere else. Exclusive deals typically offer 10-25% off and may include perks like: free retakes, extended time limits, or reduced consistency requirements. Marked with the purple 'Exclusive' badge.</p>
          </div>
          <div className={cardMain}>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-amber-400" />
              <div className={headingCard}>Public Coupon Codes</div>
            </div>
            <p className={bodySmall}>Publicly available discount codes collected from prop firms' official promotions. These may have lower discounts than exclusive deals but still represent savings over retail. The marketplace checks code validity regularly and removes expired codes.</p>
          </div>
        </div>
      </div>

      {/* SAVINGS */}
      <div id="savings">
        <div className={eyebrowStyle}>TRACKING</div>
        <h2 className="ref-h-section mt-2">Savings Tracker</h2>
        <div className="cardMain">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--qe-ref-green)]/10 p-2 text-[var(--qe-ref-green)]"><Gift className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold mb-2">Your Personal Savings Dashboard</div>
              <p className="text-sm text-[var(--qe-ref-text-muted])">Every deal you redeem through the marketplace is tracked in your personal savings dashboard (accessible from Settings → Deals). See: total money saved, deals used, best discount redeemed, and upcoming deal expirations. If a deal you used gets a better version later, you'll be notified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq">
        <div className={eyebrowStyle}>QUESTIONS</div>
        <h2 className="ref-h-section mt-2">Common Questions</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((faq, index) => (
            <details key={index} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? null : index)} className="group rounded-xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium">
                {faq.q}
                <span className="text-[var(--qe-ref-text-muted)] group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[var(--qe-ref-text-muted)] border-t border-[var(--qe-ref-card-border)] pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] p-8 text-center">
        <div className="text-lg font-semibold tracking-tight">Save on your next challenge</div>
        <p className="mt-2 text-sm text-[var(--qe-ref-text-muted])">Exclusive discounts on every major prop firm. Check before you buy.</p>
        <Link href={`/${locale}/docs/leaderboard`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-8 py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Next: Leaderboard <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-4 text-[11px] text-[var(--qe-ref-text-muted)]">Also see: <Link href={`/${locale}/docs/propfirms`} className="underline underline-offset-2 hover:no-underline">Prop Firm Catalogue</Link></div>
      </div>

      <div className="text-center text-[10px] text-[var(--qe-ref-text-muted)] pt-4">Deals are verified regularly. If a code stops working, report it and we will flag it within 24 hours.</div>
    </div>
  )
}
