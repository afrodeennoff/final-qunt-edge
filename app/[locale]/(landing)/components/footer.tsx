'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, MessageCircle, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useI18n, useCurrentLocale } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

const PRODUCT_LINKS: FooterLink[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Prop Firms', href: '/propfirms' },
  { name: 'Deals', href: '/deals' },
  { name: 'Teams', href: '/teams' },
]

const SUPPORT_LINKS: FooterLink[] = [
  { name: 'Support', href: '/support' },
  { name: 'Community', href: '/community' },
  { name: 'Roadmap', href: '/updates' },
  { name: 'FAQ', href: '/faq' },
]

const LEGAL_LINKS: FooterLink[] = [
  { name: 'About', href: '/about' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Disclaimers', href: '/disclaimers' },
]

export default function Footer() {
  const t = useI18n()
  const locale = useCurrentLocale()

  const socialLinks: SocialLink[] = [
    { name: 'GitHub', href: 'https://github.com/afrodeennoff/qunt-edge', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/@TIMON', icon: Youtube },
    { name: 'Discord', href: process.env.NEXT_PUBLIC_DISCORD_INVITATION || '', icon: MessageCircle },
  ].filter((item) => item.href)

  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-white/[0.06] bg-black py-16 sm:py-20"
    >
      <h2 id="footer-heading" className="sr-only">{t('footer.heading')}</h2>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1240px] px-4 sm:px-6"
      >
        <div className="grid gap-8 rounded-[2rem] border border-white/[0.08] bg-[oklch(0.038_0.005_264)] p-6 shadow-[0_0_0_0.5px_rgba(180,210,255,0.06),0_8px_32px_-8px_rgba(0,0,0,0.80)] lg:grid-cols-[1.2fr_1.8fr] sm:p-8 lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--frost-border)] bg-white/[0.02] shadow-[0_18px_36px_-24px_rgba(4,10,24,0.85)]">
                <Logo className="h-5 w-5 fill-foreground" />
              </div>
              <div className="leading-none">
                <div className="text-[13px] font-semibold tracking-[-0.02em] text-foreground/95">Qunt Edge</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/30">Trading Intelligence</div>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t('footer.description')}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${locale}/support`}
                prefetch={false}
                className="rounded-full border border-[var(--frost-border)] px-4 py-2 text-[11px] font-medium text-foreground/95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0"
              >
                Contact Support
              </Link>
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                prefetch={false}
                className="rounded-full bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0"
              >
                Start Free Audit
              </Link>
            </div>

            <div className="h-px w-full max-w-md bg-[var(--frost-border)]" />

            <div className="flex items-center gap-2">
              {socialLinks.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--frost-border)] text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-accent/10"
                >
                  <item.icon className="size-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FooterColumn title="Product" links={PRODUCT_LINKS} />
            <FooterColumn title="Support" links={SUPPORT_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--frost-border)] pt-5 text-muted-foreground/90">
          <p className="text-[12px] text-foreground/25 tracking-[-0.005em]">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/70">{t('disclaimer.risk.content')}</p>
        </div>
      </motion.div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const locale = useCurrentLocale()
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/30 mb-4">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((item, idx) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
          >
            <Link
              href={`/${locale}${item.href}`}
              prefetch={false}
              className="inline-flex rounded-full px-2 py-1 text-[13px] text-foreground/50 hover:text-foreground/95 transition-colors duration-150 tracking-[-0.005em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-0"
            >
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
