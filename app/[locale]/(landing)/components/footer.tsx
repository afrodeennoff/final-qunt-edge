'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Github, MessageCircle, Youtube } from 'lucide-react'
import {
  unifiedGhostActionClassName,
  unifiedPrimaryActionClassName,
} from '@/components/layout/unified-page-recipes'
import { MARKETING_SHELL_WIDTH } from '@/lib/constants/layout'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useCurrentLocale, useI18n } from '@/locales/client'

type FooterLink = { name: string; href: string }
type SocialLink = FooterLink & { icon: ComponentType<{ className?: string }> }

export default function Footer() {
  const t = useI18n()
  const locale = useCurrentLocale()

  const productLinks: FooterLink[] = [
    { name: String(t('landing.footerNew.features')), href: '/#features' },
    { name: String(t('landing.footerNew.pricing')), href: '/pricing' },
    { name: String(t('landing.navbar.propFirms')), href: '/propfirms' },
    { name: String(t('landing.navbar.propFirmPerk')), href: '/deals' },
    { name: String(t('landing.navbar.teams')), href: '/teams' },
  ]

  const supportLinks: FooterLink[] = [
    { name: String(t('landing.footerNew.support')), href: '/support' },
    { name: String(t('landing.footerNew.community')), href: '/community' },
    { name: String(t('landing.footerNew.changelog')), href: '/updates' },
    { name: String(t('landing.footerNew.faq')), href: '/faq' },
  ]

  const legalLinks: FooterLink[] = [
    { name: String(t('landing.footerNew.about')), href: '/about' },
    { name: String(t('landing.footerNew.privacy')), href: '/privacy' },
    { name: String(t('landing.footerNew.terms')), href: '/terms' },
    { name: String(t('landing.footerNew.disclaimers')), href: '/disclaimers' },
  ]

  const socialLinks: SocialLink[] = [
    { name: 'GitHub', href: 'https://github.com/afrodeennoff/qunt-edge', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/@TIMON', icon: Youtube },
    {
      name: 'Discord',
      href: process.env.NEXT_PUBLIC_DISCORD_INVITATION || '',
      icon: MessageCircle,
    },
  ].filter((item) => item.href)

  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-border/30 bg-background py-14 sm:py-20"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <motion.div
        initial={false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10', MARKETING_SHELL_WIDTH)}
      >
        <div
          className={cn(
            'rounded-2xl border border-border/50 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_32px_-26px_rgba(0,0,0,0.62)]',
            'grid gap-8 p-7 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:p-10',
          )}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Logo className="h-5 w-5 fill-current" />
              </div>
              <div className="leading-none">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Qunt Edge
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t('landing.footerNew.brandLabel')}
                </div>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground/80">
              {t('landing.footerNew.tagline')}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/support`}
                prefetch={false}
                className={cn(unifiedGhostActionClassName, 'px-4 py-2 text-xs')}
              >
                {t('landing.footerNew.contactSupport')}
              </Link>
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                prefetch={false}
                className={cn(unifiedPrimaryActionClassName, 'px-4 py-2 text-xs')}
              >
                {t('landing.footerNew.startAudit')}
              </Link>
            </div>

            <div className="h-px w-full max-w-sm bg-[oklch(0.65_0.22_260_/_0.09)]" />

            <div className="flex items-center gap-2.5">
              {socialLinks.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.05, duration: 0.35 }}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.65_0.22_260_/_0.075)] bg-[oklch(0.056_0.01_260_/_0.74)] text-muted-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)] transition-[background-color,border-color,color,box-shadow] duration-200 hover:border-[oklch(0.65_0.22_260_/_0.13)] hover:bg-[oklch(0.06_0.011_260_/_0.82)] hover:text-primary',
                  )}
                >
                  <item.icon className="size-[18px]" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <FooterColumn title={String(t('landing.footerNew.product'))} links={productLinks} />
            <FooterColumn title={String(t('landing.footerNew.support'))} links={supportLinks} />
            <FooterColumn title={String(t('landing.footerNew.legal'))} links={legalLinks} />
          </div>
        </div>

        <div className="mt-8 border-t border-[oklch(0.65_0.22_260_/_0.08)] pt-6">
          <p className="text-xs tracking-[-0.005em] text-muted-foreground/70">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground/50">
            {t('disclaimer.risk.content')}
          </p>
        </div>
      </motion.div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const locale = useCurrentLocale()

  return (
    <div>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/60">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((item, index) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
          >
            <Link
              href={`/${locale}${item.href}`}
              prefetch={false}
              className="inline-flex rounded-lg px-2 py-1 text-sm text-muted-foreground/80 transition-[color,background-color] duration-200 hover:bg-[oklch(0.65_0.22_260_/_0.04)] hover:text-foreground"
            >
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
