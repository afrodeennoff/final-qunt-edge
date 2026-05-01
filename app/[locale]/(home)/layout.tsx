import LocaleLayoutInner from "./locale-layout-inner"

import type { Metadata } from 'next';

type Locale = 'en' | 'fr';

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  const descriptions: Record<Locale, string> = {
    en: 'Centralize and visualize your trading performance across multiple brokers. Track, analyze, and improve your trading journey with powerful analytics.',
    fr: 'Centralisez et visualisez vos performances de trading à travers différents brokers. Suivez, analysez et améliorez votre parcours de trading avec des analyses puissantes.',
  };
  const description = descriptions[params.locale] || descriptions.en;
  return {
    title: 'Qunt Edge',
    description,
  };
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LocaleLayoutInner>{children}</LocaleLayoutInner>
}
