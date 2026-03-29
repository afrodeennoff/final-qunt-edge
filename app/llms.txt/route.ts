import { getSiteOrigin } from "@/lib/site-url";

export function GET() {
  const siteOrigin = getSiteOrigin();
  const lines = [
    "# Qunt Edge",
    "",
    "Qunt Edge is a web-based trading journal and analytics platform for discretionary traders and trading teams.",
    "",
    "## Canonical Pages",
    `- ${siteOrigin}/en`,
    `- ${siteOrigin}/en/best-trading-journal`,
    `- ${siteOrigin}/en/deals`,
    `- ${siteOrigin}/en/propfirms`,
    `- ${siteOrigin}/en/leaderboard`,
    `- ${siteOrigin}/en/pricing`,
    `- ${siteOrigin}/en/faq`,
    `- ${siteOrigin}/en/support`,
    `- ${siteOrigin}/en/privacy`,
    `- ${siteOrigin}/en/terms`,
    "",
    "## Locales",
    `- ${siteOrigin}/en`,
    `- ${siteOrigin}/fr`,
    "",
    "## Product Scope",
    "- Trade journaling and performance analysis",
    "- Behavior and execution review workflows",
    "- Prop-firm deal discovery and comparison surfaces",
    "- Team-oriented analytics and collaboration areas",
    "",
    "## Contact & Policies",
    "- Contact: mailto:contact@qunt-edge.com",
    `- Support: ${siteOrigin}/en/support`,
    `- Privacy: ${siteOrigin}/en/privacy`,
    `- Terms: ${siteOrigin}/en/terms`,
    "",
    "## Crawling Note",
    "Private app areas (dashboard, admin, authentication, private APIs) are intentionally non-indexable.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
