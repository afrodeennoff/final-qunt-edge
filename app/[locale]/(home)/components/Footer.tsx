
"use client"

import React from 'react';
import Link from 'next/link';
import { useCurrentLocale } from '@/locales/client';

const Footer: React.FC = () => {
    const locale = useCurrentLocale();
    return (
        <footer className="border-t border-border/70 bg-background px-fluid-sm py-fluid-lg">
            <div className="container-fluid grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr_auto] md:items-start">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center font-bold text-primary-foreground text-xs">Q</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono text-foreground">Qunt Edge</span>
                </div>

                <div className="grid max-w-2xl grid-cols-2 gap-8 text-xs font-bold uppercase tracking-[0.12em] text-foreground/80 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <span className="mb-2 text-foreground">Product</span>
                        <Link href={`/${locale}/#features`} className="hover:text-foreground transition-colors">Features</Link>
                        <Link href={`/${locale}/pricing`} className="hover:text-foreground transition-colors">Pricing</Link>
                        <Link href={`/${locale}/propfirms`} className="hover:text-foreground transition-colors">Prop Firms Catalogue</Link>
                        <Link href={`/${locale}/teams`} className="hover:text-foreground transition-colors">Teams</Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="mb-2 text-foreground">Support</span>
                        <Link href={`/${locale}/support`} className="hover:text-foreground transition-colors">Support Center</Link>
                        <Link href={`/${locale}/community`} className="hover:text-foreground transition-colors">Community</Link>
                        <Link href={`/${locale}/updates`} className="hover:text-foreground transition-colors">Roadmap</Link>
                        <Link href={`/${locale}/about`} className="hover:text-foreground transition-colors">About</Link>
                        <Link href={`/${locale}/faq`} className="hover:text-foreground transition-colors">FAQ</Link>
                        <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href={`/${locale}/disclaimers`} className="hover:text-foreground transition-colors">Disclaimers</Link>
                    </div>
                </div>
                <div className="text-xs mono text-foreground/80 md:text-right">
                    © {new Date().getFullYear()} Qunt Edge. All rights reserved. Professional trading analytics.
                </div>
            </div>
            <div className="container-fluid mt-6 h-px bg-[hsl(var(--mk-border)/0.34)]" />
            <div className="container-fluid mt-5 flex flex-wrap items-center gap-2">
                <Link
                    href={`/${locale}/support`}
                    className="rounded-full border border-[hsl(var(--mk-border)/0.38)] px-4 py-2 text-[11px] font-medium text-[hsl(var(--mk-text))] transition-all hover:border-[hsl(var(--brand-primary)/0.5)]"
                >
                    Contact Support
                </Link>
                <Link
                    href={`/${locale}/authentication?next=dashboard`}
                    className="rounded-full bg-primary px-4 py-2 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                    Start Free Audit
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
