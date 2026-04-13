import { Metadata } from 'next';
import { setStaticParamsLocale } from "next-international/server";
import Link from "next/link";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return buildPublicMetadata({
      locale,
      path: "/docs",
      title: "Documentation | Qunt Edge",
      description: "Guides and references for Qunt Edge trading journal, analytics workflows, and integrations.",
    });
}

export default async function DocsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    return (
        <div className="w-full py-20 px-4 sm:px-6 sm:py-24 lg:px-8">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground/95 mb-4">Documentation</h1>
                <p className="text-xl text-muted-foreground">Everything you need to master Qunt Edge workflows.</p>
            </header>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="p-6 rounded-xl bg-white/[0.070] border border-[oklch(0.65_0.22_260/0.08)] hover:border-border/36 transition-colors group">
                    <h2 className="text-lg font-bold text-foreground/95 mb-2 group-hover:text-foreground/95 transition-colors">Getting Started</h2>
                    <p className="text-muted-foreground text-sm mb-4">New to Qunt Edge? Learn the basics and set up your institutional-grade dashboard in minutes.</p>
                    <span className="text-foreground/95 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-xl bg-white/[0.070] border border-[oklch(0.65_0.22_260/0.08)] hover:border-border/36 transition-colors group">
                    <h2 className="text-lg font-bold text-foreground/95 mb-2 group-hover:text-foreground/95 transition-colors">Data Connectors</h2>
                    <p className="text-muted-foreground text-sm mb-4">Detailed guides on connecting Tradovate, Rithmic, IBKR, and more to your intelligence layer.</p>
                    <span className="text-foreground/95 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-xl bg-white/[0.070] border border-[oklch(0.65_0.22_260/0.08)] hover:border-border/36 transition-colors group">
                    <h2 className="text-lg font-bold text-foreground/95 mb-2 group-hover:text-foreground/95 transition-colors">AI Journaling</h2>
                    <p className="text-muted-foreground text-sm mb-4">How to leverage our unique AI models to audit your behavioral execution, not just your PnL.</p>
                    <span className="text-foreground/95 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>

                <div className="p-6 rounded-xl bg-white/[0.070] border border-[oklch(0.65_0.22_260/0.08)] hover:border-border/36 transition-colors group">
                    <h2 className="text-lg font-bold text-foreground/95 mb-2 group-hover:text-foreground/95 transition-colors">API Reference</h2>
                    <p className="text-muted-foreground text-sm mb-4">For power users and institutions looking to integrate Qunt Edge analytics into their custom workflows.</p>
                    <span className="text-foreground/95 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
                </div>
            </div>

            <footer className="mt-24 pt-8 border-t border-[oklch(0.65_0.22_260/0.08)] text-center">
                <p className="text-muted-foreground text-sm">Need immediate help? Visit our <Link href={`/${locale}/support`} className="text-foreground/95 hover:underline">Support Center</Link> or join our <a href="https://discord.gg/efHDc43M" className="text-foreground/95 hover:underline">Discord</a>.</p>
            </footer>
        </div>
    );
}
