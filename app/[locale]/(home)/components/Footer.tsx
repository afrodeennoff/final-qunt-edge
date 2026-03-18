
"use client"

import React from 'react';
import Link from 'next/link';
import { useCurrentLocale } from '@/locales/client';

const FOOTER_LINK_CLASS =
    'text-foreground transition-colors hover:text-foreground/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0';

const Footer: React.FC = () => {
    const locale = useCurrentLocale();
    return (
        <footer className="border-t border-border/70 bg-background px-fluid-sm py-fluid-lg">
            <div className="container-fluid grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr_auto] md:items-start">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center font-bold text-primary-foreground text-xs">Q</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono text-foreground">Qunt Edge</span>
                </div>

                <div className="grid max-w-2xl grid-cols-2 gap-8 text-xs font-bold uppercase tracking-[0.12em] text-foreground sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <span className="mb-2 text-foreground">Product</span>
                        <Link href={`/${locale}/#features`} className={FOOTER_LINK_CLASS}>
                            Features
                        </Link>
                        <Link href={`/${locale}/pricing`} className={FOOTER_LINK_CLASS}>
                            Pricing
                        </Link>
                        <Link href={`/${locale}/propfirms`} className={FOOTER_LINK_CLASS}>
                            Prop Firms Catalogue
                        </Link>
                        <Link href={`/${locale}/teams`} className={FOOTER_LINK_CLASS}>
                            Teams
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="mb-2 text-foreground">Support</span>
                        <Link href={`/${locale}/support`} className={FOOTER_LINK_CLASS}>
                            Support Center
                        </Link>
                        <Link href={`/${locale}/community`} className={FOOTER_LINK_CLASS}>
                            Community
                        </Link>
                        <Link href={`/${locale}/updates`} className={FOOTER_LINK_CLASS}>
                            Roadmap
                        </Link>
                        <Link href={`/${locale}/about`} className={FOOTER_LINK_CLASS}>
                            About
                        </Link>
                        <Link href={`/${locale}/faq`} className={FOOTER_LINK_CLASS}>
                            FAQ
                        </Link>
                        <Link href={`/${locale}/privacy`} className={FOOTER_LINK_CLASS}>
                            Privacy
                        </Link>
                        <Link href={`/${locale}/terms`} className={FOOTER_LINK_CLASS}>
                            Terms
                        </Link>
                        <Link href={`/${locale}/disclaimers`} className={FOOTER_LINK_CLASS}>
                            Disclaimers
                        </Link>
                    </div>
                </div>
                <div className="text-xs mono text-foreground md:text-right">
                    © {new Date().getFullYear()} Qunt Edge. All rights reserved. Professional trading analytics.
                </div>
            </div>
            <div className="container-fluid mt-6 h-px bg-border/30" />
            <div className="container-fluid mt-5 flex flex-wrap items-center gap-2">
                <Link
                    href={`/${locale}/support`}
                    className="rounded-full border border-border/60 px-4 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-border/80 hover:bg-border/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                >
                    Contact Support
                </Link>
                <Link
                    href={`/${locale}/authentication?next=dashboard`}
                    className="rounded-full bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                >
                    Start Free Audit
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
