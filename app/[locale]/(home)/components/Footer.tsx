'use client'

import Link from 'next/link'
import { Twitter, Github, MessageCircle } from 'lucide-react'
import { useCurrentLocale } from '@/locales/client'

export default function Footer() {
  const locale = useCurrentLocale()

  const footerLinks = {
    product: [
      { label: 'Features', href: `/${locale}/#features` },
      { label: 'Pricing', href: `/${locale}/pricing` },
      { label: 'Prop Firms', href: `/${locale}/propfirms` },
      { label: 'Updates', href: `/${locale}/updates` },
    ],
    resources: [
      { label: 'Documentation', href: `/${locale}/docs` },
      { label: 'Blog', href: `/${locale}/blogs` },
      { label: 'Community', href: `/${locale}/community` },
      { label: 'Support', href: `/${locale}/support` },
    ],
    company: [
      { label: 'About', href: `/${locale}/about` },
      { label: 'Terms', href: `/${locale}/terms` },
      { label: 'Privacy', href: `/${locale}/privacy` },
      { label: 'Disclaimers', href: `/${locale}/disclaimers` },
    ],
  }

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/quntedge' },
    { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg/quntedge' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/quntedge' },
  ]

  return (
    <footer className="border-t border-border/20 bg-background/0.04">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-10 mb-10">
          <div className="col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_16px_-4px_hsl(var(--primary)/0.5)] transition-shadow duration-300 group-hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.65)]">
                <span className="text-primary-foreground font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">Qunt Edge</span>
            </Link>
            <p className="text-[0.875rem] text-muted-foreground/70 max-w-xs leading-relaxed">
              The trading journal and analytics platform for discretionary traders who take their craft seriously.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-[0.85rem] tracking-[-0.01em]">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-[0.85rem] tracking-[-0.01em]">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-[0.85rem] tracking-[-0.01em]">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.85rem] text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40">
          <p className="text-[0.8rem] text-muted-foreground/60">
            &copy; 2026 Qunt Edge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/50 hover:text-foreground transition-colors duration-200 p-1 rounded-lg hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  aria-label={social.label}
                >
                  <Icon className="w-[1.15rem] h-[1.15rem]" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
