'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, MessageCircle, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
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
      className="border-t border-border/50 bg-black py-16 md:py-20"
    >
      <h2 id="footer-heading" className="sr-only">
        {t('footer.heading')}
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 rounded-lg border border-border/50 bg-card/80 p-6 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:p-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
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

            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              {t('landing.footerNew.tagline')}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${locale}/support`}
                prefetch={false}
                className="rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-background/60"
              >
                {t('landing.footerNew.contactSupport')}
              </Link>
              <Link
                href={`/${locale}/authentication?next=dashboard`}
                prefetch={false}
                className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('landing.footerNew.startAudit')}
              </Link>
            </div>

            <div className="h-px w-full max-w-md bg-border/50" />

            <div className="flex items-center gap-2">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-background/60 hover:text-primary"
                >
                  <item.icon className="size-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FooterColumn title={String(t('landing.footerNew.product'))} links={productLinks} />
            <FooterColumn title={String(t('landing.footerNew.support'))} links={supportLinks} />
            <FooterColumn title={String(t('landing.footerNew.legal'))} links={legalLinks} />
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-5 text-muted-foreground/90">
          <p className="text-xs tracking-[-0.005em] text-foreground/30">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground/70">
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
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
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
              className="inline-flex rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
