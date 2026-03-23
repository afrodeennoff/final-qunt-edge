'use client'

import React from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/locales/client'
import { Github, Twitter, MessageCircle } from 'lucide-react'

const FOOTER_LINK_CLASS =
  'text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0'

const Footer: React.FC = () => {
  const locale = useCurrentLocale()
  return (
    <footer className="border-t border-border/70 bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr_auto] md:items-start">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">Q</div>
              <span className="text-lg font-bold tracking-tight [font-family:var(--home-display)]">Qunt Edge</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-foreground/80 [font-family:var(--home-copy)]">
              AI-powered trading journal and performance review platform for discretionary futures traders.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/hugodemenez/qunt-edge" target="_blank" rel="noopener noreferrer" className="text-foreground/80 transition-colors hover:text-foreground" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/a5YVF5Ec2n" target="_blank" rel="noopener noreferrer" className="text-foreground/80 transition-colors hover:text-foreground" aria-label="Discord">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/quntedge" target="_blank" rel="noopener noreferrer" className="text-foreground/80 transition-colors hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid max-w-2xl grid-cols-2 gap-8 text-xs font-bold uppercase tracking-[0.12em] text-foreground/80 sm:grid-cols-3 [font-family:var(--home-copy)]">
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-foreground">Product</span>
              <Link href={`/${locale}/#features`} className={FOOTER_LINK_CLASS}>Features</Link>
              <Link href={`/${locale}/pricing`} className={FOOTER_LINK_CLASS}>Pricing</Link>
              <Link href={`/${locale}/propfirms`} className={FOOTER_LINK_CLASS}>Prop Firms</Link>
              <Link href={`/${locale}/deals`} className={FOOTER_LINK_CLASS}>Deals</Link>
              <Link href={`/${locale}/leaderboard`} className={FOOTER_LINK_CLASS}>Leaderboard</Link>
              <Link href={`/${locale}/teams`} className={FOOTER_LINK_CLASS}>Teams</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-foreground">Support</span>
              <Link href={`/${locale}/support`} className={FOOTER_LINK_CLASS}>Support Center</Link>
              <Link href={`/${locale}/community`} className={FOOTER_LINK_CLASS}>Community</Link>
              <Link href={`/${locale}/updates`} className={FOOTER_LINK_CLASS}>Roadmap</Link>
              <Link href={`/${locale}/about`} className={FOOTER_LINK_CLASS}>About</Link>
              <Link href={`/${locale}/faq`} className={FOOTER_LINK_CLASS}>FAQ</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-foreground">Legal</span>
              <Link href={`/${locale}/privacy`} className={FOOTER_LINK_CLASS}>Privacy</Link>
              <Link href={`/${locale}/terms`} className={FOOTER_LINK_CLASS}>Terms</Link>
              <Link href={`/${locale}/disclaimers`} className={FOOTER_LINK_CLASS}>Disclaimers</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/authentication?next=dashboard`}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all duration-300 hover:bg-primary/90 [font-family:var(--home-copy)]"
            >
              Start Free Audit
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/60 px-6 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-card/50 [font-family:var(--home-copy)]"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border/30 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-foreground/80 [font-family:var(--home-copy)]">
              &copy; {new Date().getFullYear()} Qunt Edge. All rights reserved.
            </p>
            <p className="text-xs text-foreground/80 [font-family:var(--home-copy)]">
              Professional trading analytics for serious discretionary traders.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
