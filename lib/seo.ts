import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";

export const INDEXABLE_LOCALES = ["en", "fr"] as const;
type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];

export type FaqSchemaItem = {
  question: string;
  answer: string;
};

type MetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
};

function normalizeLocale(locale: string): IndexableLocale {
  return locale === "fr" ? "fr" : "en";
}

function normalizePath(path: string): string {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function buildLocalePath(locale: IndexableLocale, path: string): string {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

function absoluteUrl(path: string): string {
  return `${getSiteOrigin()}${path}`;
}

export function getCanonicalUrl(locale: string, path: string): string {
  return absoluteUrl(buildLocalePath(normalizeLocale(locale), path));
}

export function getLocaleAlternates(locale: string, path: string) {
  const canonical = getCanonicalUrl(locale, path);
  const enUrl = absoluteUrl(buildLocalePath("en", path));
  const frUrl = absoluteUrl(buildLocalePath("fr", path));

  return {
    canonical,
    languages: {
      "x-default": enUrl,
      "en-US": enUrl,
      "fr-FR": frUrl,
    },
  } as const;
}

export function buildPublicMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
}: MetadataInput): Metadata {
  const canonical = getCanonicalUrl(locale, path);
  const normalizedLocale = normalizeLocale(locale);

  return {
    title,
    description,
    alternates: getLocaleAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Qunt Edge",
      type,
      locale: normalizedLocale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Qunt Edge",
    url: getSiteOrigin(),
    email: "contact@qunt-edge.com",
  };
}

export function buildBreadcrumbSchema(
  locale: string,
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(locale, item.path),
    })),
  };
}

export function buildSoftwareApplicationSchema(locale: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Qunt Edge",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: getCanonicalUrl(locale, path),
    description:
      "Trading journal and analytics platform for discretionary traders with performance review, behavior analysis, and execution tracking.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Trade journaling and performance review",
      "Behavior and execution analytics",
      "Broker and platform import workflows",
      "Prop-firm deal discovery and comparison",
      "Team analytics for multi-trader workflows",
    ],
  };
}

export function buildFaqPageSchema(items: readonly FaqSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
