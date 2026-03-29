
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildSoftwareApplicationSchema,
} from "@/lib/seo";

type Locale = 'en' | 'fr';

export function generateStaticParams() {
    return getStaticParams();
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return buildPublicMetadata({
      locale,
      path: "/",
      title: "Best Trading Journal for Discretionary Traders | Qunt Edge",
      description:
        "Qunt Edge helps serious traders audit execution quality, track behavioral drift, and improve consistency with structured post-session review workflows.",
    });
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    const softwareSchema = buildSoftwareApplicationSchema(locale, "/");
    const organizationSchema = buildOrganizationSchema();
    const breadcrumbSchema = buildBreadcrumbSchema(locale, [
      { name: "Home", path: "/" },
    ]);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <HomeContent locale={locale} />
      </>
    );
}
