import type { Metadata } from "next";
import Link from "next/link";
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell";
import { getDealsOverview } from "@/server/deals";
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
  type FaqSchemaItem,
} from "@/lib/seo";

const FAQ_ITEMS: readonly FaqSchemaItem[] = [
  {
    question: "What makes Qunt Edge a better trading journal than spreadsheets?",
    answer:
      "Spreadsheets track outcomes, but Qunt Edge is built for review workflows: execution notes, behavior analysis, and repeatable post-session diagnostics in one place.",
  },
  {
    question: "Can I use Qunt Edge with prop-firm workflows?",
    answer:
      "Yes. Qunt Edge includes public prop-firm comparison and deals surfaces so you can connect journal review with funding decisions.",
  },
  {
    question: "Does Qunt Edge provide signals or copy trading?",
    answer:
      "No. Qunt Edge is a decision-review and analytics platform designed to improve your own execution process.",
  },
  {
    question: "Can teams use the same platform?",
    answer:
      "Yes. Teams can use shared analytics areas to review trader performance and behavior with consistent structure.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    path: "/best-trading-journal",
    title: "Best Trading Journal for Discretionary Traders | Qunt Edge",
    description:
      "Discover why Qunt Edge is built as a decision-review trading journal for discretionary and prop-firm traders, with analytics, behavior context, and workflow depth.",
  });
}

export default async function BestTradingJournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let overview: Awaited<ReturnType<typeof getDealsOverview>> | null = null;
  try {
    overview = await getDealsOverview();
  } catch {
    overview = null;
  }

  const organizationSchema = buildOrganizationSchema();
  const softwareSchema = buildSoftwareApplicationSchema(locale, "/best-trading-journal");
  const faqSchema = buildFaqPageSchema(FAQ_ITEMS);
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: "Home", path: "/" },
    { name: "Best Trading Journal", path: "/best-trading-journal" },
  ]);

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <UnifiedSurface className="space-y-10">
        <section className="space-y-5">
          <p className="inline-flex rounded-full border border-border/26 bg-white/[0.070] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Trading Journal Guide
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground/95 sm:text-5xl">
            Best Trading Journal for Discretionary Traders
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Qunt Edge is built for post-session decision review, not just static logging. Use it to audit execution quality, behavioral drift,
            and risk discipline with a repeatable workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/authentication?next=dashboard`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Start Free Audit
            </Link>
            <Link href={`/${locale}/deals`} className="rounded-full border border-border/26 bg-[oklch(0.65_0.22_260/0.03)] px-5 py-3 text-sm font-semibold text-foreground/95">
              Explore Deals
            </Link>
            <Link href={`/${locale}/propfirms`} className="rounded-full border border-border/26 bg-[oklch(0.65_0.22_260/0.03)] px-5 py-3 text-sm font-semibold text-foreground/95">
              Compare Prop Firms
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.050] p-5">
            <h2 className="text-xl font-semibold text-foreground/95">Why traders outgrow spreadsheets</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Manual rows capture outcomes but usually miss execution context.</li>
              <li>Behavior patterns are hard to detect without structured review fields.</li>
              <li>Cross-session consistency breaks when templates drift over time.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.050] p-5">
            <h2 className="text-xl font-semibold text-foreground/95">What Qunt Edge adds</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Centralized journal + chart + behavior review workflows.</li>
              <li>Execution analytics and performance breakdowns in one interface.</li>
              <li>Structured paths from journaling to funding and firm comparison decisions.</li>
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.050] p-5">
          <h2 className="text-2xl font-semibold text-foreground/95">Feature Evidence From Existing Product Capabilities</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <h3 className="font-semibold text-foreground/95">Execution Review</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Session-level journaling, chart reviews, and behavior context designed for discretionary decision quality.
              </p>
            </article>
            <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <h3 className="font-semibold text-foreground/95">Performance Analytics</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Trade and account analytics surfaces help isolate patterns across setups, time windows, and outcomes.
              </p>
            </article>
            <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <h3 className="font-semibold text-foreground/95">Prop-Firm Research Flow</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Public deals and prop-firm pages connect journal decisions to challenge cost and rule context.
              </p>
            </article>
            <article className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <h3 className="font-semibold text-foreground/95">Team Workflows</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Team areas provide shared analytics and trader-level review structure for prop environments.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.050] p-5">
          <h2 className="text-2xl font-semibold text-foreground/95">Trust Signals Backed by Internal Product Data</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Qunt Edge publishes connected public surfaces (leaderboard, community, support, and firm/deal datasets) so users can validate workflow context.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Tracked Firms</p>
              <p className="mt-2 text-2xl font-semibold text-foreground/95">{overview?.totalTrackedFirms ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Live Deals</p>
              <p className="mt-2 text-2xl font-semibold text-foreground/95">{overview?.totalLiveDeals ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Paid Payouts Tracked</p>
              <p className="mt-2 text-2xl font-semibold text-foreground/95">
                {typeof overview?.totalPaidPayoutCount === "number" ? overview.totalPaidPayoutCount : "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.050] p-5">
          <h2 className="text-2xl font-semibold text-foreground/95">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.03)] p-4">
                <h3 className="font-semibold text-foreground/95">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[oklch(0.65_0.22_260/0.08)] bg-white/[0.060] p-5 text-center">
          <h2 className="text-2xl font-semibold text-foreground/95">Build a Repeatable Review System</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Move from fragmented logs to a workflow that supports consistent execution review and better decision quality.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={`/${locale}/authentication?next=dashboard`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Start Free Audit
            </Link>
            <Link href={`/${locale}/deals`} className="rounded-full border border-border/26 bg-[oklch(0.65_0.22_260/0.03)] px-5 py-3 text-sm font-semibold text-foreground/95">
              Review Deals
            </Link>
            <Link href={`/${locale}/propfirms`} className="rounded-full border border-border/26 bg-[oklch(0.65_0.22_260/0.03)] px-5 py-3 text-sm font-semibold text-foreground/95">
              Compare Firms
            </Link>
          </div>
        </section>
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
