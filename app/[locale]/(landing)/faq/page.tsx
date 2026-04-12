import { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { setStaticParamsLocale } from "next-international/server";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";
import { buildBreadcrumbSchema, buildFaqPageSchema, buildOrganizationSchema, buildPublicMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    path: "/faq",
    title: "Trading Journal FAQ | Qunt Edge",
    description:
      "Frequently asked questions about Qunt Edge trading-journal workflows, broker support, security, and team analytics.",
  });
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    const faqs = [
        {
            question: "What makes Qunt Edge different from traditional journals?",
            answer: "Traditional journals focus on PnL—a lagging indicator. Qunt Edge audits your clinical execution. We help you identify the behavioral leakages that happen between the chart and the trade button."
        },
        {
            question: "Which brokers and platforms do you support?",
            answer: "We support major institutional and retail platforms including Tradovate, Rithmic, Interactive Brokers (IBKR), and CQG. We are constantly adding new connectors based on community demand."
        },
        {
            question: "Is my trading data secure?",
            answer: "Security is our primary directive. Your trading data is encrypted and stored using institutional-grade protocols. We never share your individual trade data with third parties."
        },
        {
            question: "Does Qunt Edge provide trading signals?",
            answer: "No. Qunt Edge is an intelligence layer, not a signal service. We provide the tools for you to audit your own system and psychology to become a more consistent discretionary trader."
        },
        {
            question: "Can I use Qunt Edge for my trading team?",
            answer: "Yes, our Teams feature is specifically designed for proprietary trading firms and private funds to manage multiple traders with unified risk and behavioral analytics."
        }
    ];
    const faqSchema = buildFaqPageSchema(faqs);
    const organizationSchema = buildOrganizationSchema();
    const breadcrumbSchema = buildBreadcrumbSchema(locale, [
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]);

    return (
        <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <UnifiedSurface className="space-y-4">
                <header className="mb-6">
                    <h1 className="text-3xl font-semibold text-foreground">Frequently Asked Questions</h1>
                    <p className="mt-1 text-muted-foreground">Find answers to common questions about the platform and its features.</p>
                </header>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="mb-3 rounded-2xl bg-surface-muted px-4">
                            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2 leading-relaxed text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </UnifiedSurface>

            <UnifiedSurface className="mt-6 text-center">
                <h2 className="mb-2 text-xl font-semibold text-foreground">Still have questions?</h2>
                <p className="mb-5 text-muted-foreground">We&apos;re here to help you elevate your trading execution.</p>
                <a
                    href={`/${locale}/support`}
                    className="inline-flex items-center justify-center rounded-full border border-border/24 bg-card px-8 py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border/24 focus-visible:ring-offset-0"
                >
                    Contact Support
                </a>
            </UnifiedSurface>
        </UnifiedPageShell>
    );
}
