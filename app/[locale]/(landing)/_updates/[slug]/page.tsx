import { getPost } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllPosts, getAdjacentPosts } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import Script from "next/script";
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams as getLocaleStaticParams } from "@/locales/server";
import { UpdatesNavigation } from "@/components/updates-navigation";
import { getSiteOrigin } from "@/lib/site-url";
import { UnifiedPageShell, UnifiedPageHeader, UnifiedSurface } from "@/components/layout/unified-page-shell";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SITE_ORIGIN = getSiteOrigin();

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateStaticParams() {
  const locales = getLocaleStaticParams().map((entry) => entry.locale);
  const paths: Array<{ locale: string; slug: string }> = [];

  for (const locale of locales) {
    const posts = await getAllPosts(locale);
    paths.push(
      ...posts.map((post) => ({
        locale,
        slug: post.slug,
      }))
    );
  }

  return paths;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.slug || !resolvedParams.locale) {
      return {
        title: "Not Found",
        description: "The page you are looking for does not exist.",
      };
    }

    const { slug, locale } = resolvedParams;
    setStaticParamsLocale(locale);

    try {
      const post = await getPost(slug, locale);
      if (!post)
        return {
          title: "Not Found",
          description: "The page you are looking for does not exist.",
        };
      const { meta } = post;

      const url = `${SITE_ORIGIN}/${locale}/updates/${slug}`;

      return {
        title: meta.title,
        description: meta.description,
        alternates: {
          canonical: url,
          languages: {
            en: `${SITE_ORIGIN}/en/updates/${slug}`,
            fr: `${SITE_ORIGIN}/fr/updates/${slug}`,
          },
        },
        openGraph: {
          title: meta.title,
          description: meta.description,
          type: "article",
          publishedTime: meta.date,
          modifiedTime: meta.updatedAt || meta.date,
          url,
          siteName: "Qunt Edge",
          locale: locale,
        },
        twitter: {
          card: "summary_large_image",
          title: meta.title,
          description: meta.description,
        },
      };
    } catch (postError) {
      console.warn("Error fetching post:", postError);
      return {
        title: "Not Found",
        description: "The page you are looking for does not exist.",
      };
    }
  } catch (paramError) {
    console.warn("Error resolving params:", paramError);
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }
}

async function getPageData(slug: string, locale: string) {
  try {
    const post = await getPost(slug, locale);
    if (!post) {
      return null;
    }

    const adjacent = await getAdjacentPosts(slug, locale);
    return {
      post,
      previous: adjacent.previous,
      next: adjacent.next,
    };
  } catch (postError) {
    console.warn("Error fetching post data:", postError);
    return null;
  }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  if (!resolvedParams || !resolvedParams.slug || !resolvedParams.locale) {
    notFound();
  }

  const { slug, locale } = resolvedParams;
  setStaticParamsLocale(locale);

  const pageData = await getPageData(slug, locale);
  if (!pageData) {
    notFound();
  }

  const { post, previous, next } = pageData;
  const { meta, content } = post;
  const formattedDate = format(new Date(meta.date), "MMMM d, yyyy");
  const url = `${SITE_ORIGIN}/${locale}/updates/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: meta.image || "/og-image.png",
    datePublished: meta.date,
    dateModified: meta.updatedAt || meta.date,
    author: {
      "@type": "Organization",
      name: "Qunt Edge",
      url: SITE_ORIGIN,
    },
    publisher: {
      "@type": "Organization",
      name: "Qunt Edge",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      <Script id="json-ld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <UnifiedPageShell widthClassName="max-w-[860px]" className="py-8">
        {/* Back link */}
        <Link
          href={`/${locale}/updates`}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border frost-border-7 bg-[oklch(0.052_0.009_260_/_0.62)] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-[background-color,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:frost-border-12 hover:bg-[oklch(0.056_0.009_260_/_0.72)] hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Updates
        </Link>

        <UnifiedPageHeader
          variant="gradient"
          title={meta.title}
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={meta.date} itemProp="datePublished">
                  {formattedDate}
                </time>
              </div>
              <Badge
                variant={
                  meta.status === "in-progress"
                    ? "secondary"
                    : meta.status === "completed"
                      ? "default"
                      : "outline"
                }
              >
                {meta.status === "in-progress"
                  ? "In Progress"
                  : meta.status === "completed"
                    ? "Completed"
                    : "Upcoming"}
              </Badge>
            </div>
          }
        />

        {meta.image && (
          <div className="overflow-hidden rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)]">
            <Image
              src={meta.image}
              alt={meta.title}
              width={1200}
              height={600}
              className="w-full h-auto"
              priority
              itemProp="image"
            />
          </div>
        )}

        <UnifiedSurface>
          <div
            className="prose dark:prose-invert max-w-none
            prose-pre:p-0 prose-pre:bg-transparent
            prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-[oklch(0.65_0.22_260_/_0.06)] prose-code:text-muted-foreground
            dark:prose-code:bg-[oklch(0.65_0.22_260_/_0.08)] dark:prose-code:text-muted-foreground/80
            prose-table:w-full prose-table:mt-6 prose-table:mb-8
            prose-thead:border-b prose-thead:border-[oklch(0.65_0.22_260_/_0.08)]
            prose-th:px-6 prose-th:py-3 prose-th:text-left prose-th:font-semibold
            prose-td:px-6 prose-td:py-3 prose-td:border-b prose-td:border-[oklch(0.65_0.22_260_/_0.06)]
            prose-tr:transition-[background-color] prose-tr:hover:bg-[oklch(0.65_0.22_260_/_0.04)]
            prose-headings:text-foreground prose-headings:tracking-tight
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-foreground prose-a:underline prose-a:decoration-[oklch(0.65_0.22_260_/_0.3)] prose-a:underline-offset-4 hover:prose-a:decoration-[oklch(0.65_0.22_260_/_0.6)]
            prose-strong:text-foreground
            prose-li:text-muted-foreground
            prose-hr:border-[oklch(0.65_0.22_260_/_0.08)]"
            itemProp="articleBody"
          >
            {content}
          </div>
        </UnifiedSurface>

        <UpdatesNavigation
          previous={previous}
          next={next}
          locale={locale}
        />
      </UnifiedPageShell>
    </>
  );
}
