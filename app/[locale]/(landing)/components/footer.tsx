'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Github, Youtube, MessageCircle, Twitter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentLocale } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

export default function Footer() {
  const locale = useCurrentLocale()

  const productLinks: FooterLink[] = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Prop Firms\nCatalogue', href: '/propfirms' },
    { name: 'Deals', href: '/deals' },
    { name: 'Teams', href: '/teams' },
  ]

  const supportLinks: FooterLink[] = [
    { name: 'Support', href: '/support' },
    { name: 'Community', href: '/community' },
    { name: 'Changelog', href: '/updates' },
    { name: 'FAQ', href: '/faq' },
  ]

  const legalLinks: FooterLink[] = [
    { name: 'About', href: '/about' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Disclaimers', href: '/disclaimers' },
  ]

  const socialLinks: SocialLink[] = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/afrodeennoff/qunt-edge', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/@TIMON', icon: Youtube },
    {
      name: 'Discord',
      href: process.env.NEXT_PUBLIC_DISCORD_INVITATION || '',
      icon: MessageCircle,
    },
  ].filter((item) => item.href)

  return (
    <footer className="relative w-full border-t border-white/[0.08] bg-black pt-16 pb-8">
      <div className="mx-auto w-full max-w-[1200px] px-6">

        {/* Main grid: brand col + 3 link cols */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">

          {/* ── Brand column ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <h2 className="text-[26px] font-bold tracking-[-0.03em] text-white leading-none">
              QUNT EDGE
            </h2>

            <p className="max-w-[320px] text-[13px] leading-relaxed text-white/50">
              The AI-powered trading journal platform built for serious traders who demand lasting edge.
            </p>

            {/* Contact Support — ghost pill button */}
            <div>
              <Link
                href={`/${locale}/support`}
                className="inline-flex items-center rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                Contact Support
              </Link>
            </div>

            {/* Social icons — outlined circles */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.35 }}
                  whileHover={{ scale: 1.06, borderColor: 'rgba(255,255,255,0.35)' }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white/45 transition-colors hover:border-white/30 hover:text-white/70"
                >
                  <item.icon className="h-[17px] w-[17px]" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* ── Product ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-4">
              Product
            </h3>
            <ul className="space-y-2.5">
              {productLinks.map((item, index) => (
                <li key={item.name}>
                  <Link
                    href={`/${locale}${item.href}`}
                    prefetch={false}
                    className="text-[13px] text-white/45 transition-colors duration-200 hover:text-white/75 whitespace-pre-line leading-snug"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Support ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/${locale}${item.href}`}
                    prefetch={false}
                    className="text-[13px] text-white/45 transition-colors duration-200 hover:text-white/75"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Legal ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/${locale}${item.href}`}
                    prefetch={false}
                    className="text-[13px] text-white/45 transition-colors duration-200 hover:text-white/75"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom divider bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 border-t border-white/[0.07] pt-5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-white/35">
            <p>
              &copy; {new Date().getFullYear()} Qunt Edge. All rights reserved. Built for traders who demand excellence.
            </p>
            <div className="flex items-center gap-2">
              <span>Public API (MCP):</span>
              <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/35">
                /api/mcp/public
              </code>
              <span>&mdash; no auth required</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
