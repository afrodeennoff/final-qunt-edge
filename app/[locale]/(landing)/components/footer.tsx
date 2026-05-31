'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Github,
  Youtube,
  MessageCircle,
  Twitter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

export default function Footer() {
  const t = useI18n()
  const locale = useCurrentLocale()

  const productLinks: FooterLink[] = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Prop Firms Catalogue', href: '/propfirms' },
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
    <footer className="relative w-full border-t border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-surface)] pt-14 pb-8">
      <div className="mx-auto w-full max-w-[1100px] px-6">

        {/* Main footer grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* Left column — brand + CTA + social */}
          <div className="space-y-6">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-2xl font-bold tracking-tight text-[var(--qe-ref-green)]">
                QUNT EDGE
              </div>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[var(--qe-ref-text-muted)]">
                The AI-powered trading journal platform built for serious traders who demand lasting edge.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={`/${locale}/authentication`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--qe-ref-green)] px-5 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/${locale}/support`}
                className="inline-flex items-center rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] px-5 py-2.5 text-[13px] font-medium text-[var(--qe-ref-text-muted)] transition-colors hover:border-[var(--qe-ref-green)]/30 hover:text-[var(--qe-ref-text)]"
              >
                Contact Support
              </Link>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2.5"
            >
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
                  transition={{ delay: 0.22 + index * 0.05, duration: 0.35 }}
                  whileHover={{ scale: 1.08, borderColor: 'rgba(0,255,159,0.4)' }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--qe-ref-card-border)] bg-[var(--qe-ref-card)] text-[var(--qe-ref-text-muted)] transition-colors hover:border-[var(--qe-ref-green)]/30 hover:text-[var(--qe-ref-green)]"
                >
                  <item.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right column — link groups */}
          <div className="grid grid-cols-3 gap-6">
            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--qe-ref-text)] mb-3.5">
                Product
              </h4>
              <ul className="space-y-2.5">
                {productLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -4 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={`/${locale}${item.href}`}
                      prefetch={false}
                      className="text-[13px] text-[var(--qe-ref-text-muted)] transition-colors hover:text-[var(--qe-ref-green)]"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--qe-ref-text)] mb-3.5">
                Support
              </h4>
              <ul className="space-y-2.5">
                {supportLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -4 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={`/${locale}${item.href}`}
                      prefetch={false}
                      className="text-[13px] text-[var(--qe-ref-text-muted)] transition-colors hover:text-[var(--qe-ref-green)]"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--qe-ref-text)] mb-3.5">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {legalLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -4 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + index * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={`/${locale}${item.href}`}
                      prefetch={false}
                      className="text-[13px] text-[var(--qe-ref-text-muted)] transition-colors hover:text-[var(--qe-ref-green)]"
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom divider + copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 border-t border-[var(--qe-ref-card-border)] pt-6"
        >
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-[11px] text-[var(--qe-ref-text-muted)]">
              &copy; {new Date().getFullYear()} Qunt Edge. All rights reserved. Built for traders who demand excellence.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[var(--qe-ref-text-muted)]">
              <span>Public API (MCP):</span>
              <code className="rounded bg-[var(--qe-ref-surface-2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--qe-ref-text-muted)]">
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
