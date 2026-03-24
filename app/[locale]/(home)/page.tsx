
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';
import { getActiveDeals, getDealsOverview, getUnifiedFirms } from '@/server/deals'

const SITE_ORIGIN = 'https://quntedge.com'

export function generateStaticParams() {
    return getStaticParams();
}

export const revalidate = 180;
// export const dynamic = "force-static"; // Removed for webapp flexibility
// export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const canonical = `${SITE_ORIGIN}/${locale}`;

    return {
        title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
        description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
        alternates: {
            canonical,
            languages: {
                'en-US': `${SITE_ORIGIN}/en`,
                'fr-FR': `${SITE_ORIGIN}/fr`,
                'x-default': `${SITE_ORIGIN}/en`,
            },
        },
        openGraph: {
            title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
            description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
            url: canonical,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Qunt Edge | Trade Like A Pro, Review Like A Desk',
            description: 'Qunt Edge helps serious discretionary traders audit decision quality, catch behavior drift, and sharpen execution with AI-backed performance reviews.',
        },
    };
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    let firms: Awaited<ReturnType<typeof getUnifiedFirms>> = []
    let deals: Awaited<ReturnType<typeof getActiveDeals>> = []
    let overview: Awaited<ReturnType<typeof getDealsOverview>> = {
      totalTrackedFirms: 0,
      totalLiveDeals: 0,
      totalAccounts: 0,
      totalAccountValue: 0,
      totalPaidPayoutAmount: 0,
      totalPaidPayoutCount: 0,
    }

    const results = await Promise.allSettled([
      getUnifiedFirms(),
      getActiveDeals(),
      getDealsOverview(),
    ])

    firms = results[0].status === 'fulfilled' ? results[0].value : []
    deals = results[1].status === 'fulfilled' ? results[1].value : []
    overview = results[2].status === 'fulfilled' ? results[2].value : overview

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Qunt Edge',
      description: 'AI-backed trading journal and execution review platform for discretionary traders and teams.',
      url: `${SITE_ORIGIN}/${locale}`,
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <HomeContent locale={locale} firms={firms} deals={deals} overview={overview} />
      </>
    );
}
