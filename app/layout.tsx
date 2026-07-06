import React from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import {
  DM_Sans,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ScrollLockFixLazy from '@/components/lazy/scroll-lock-fix-lazy'
import { shouldEnforceDarkOnlySurfaces } from '@/lib/feature-flags'
import { getUiVariant } from '@/lib/ui-v2'
import { getSiteOrigin } from '@/lib/site-url'

const siteOrigin = getSiteOrigin()
const ROOT_DESCRIPTION =
  'Qunt Edge is a trading journal and analytics platform for discretionary traders, with structured post-session review, performance breakdowns, and team workflows.'

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const siteMetadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'Qunt Edge',
    template: '%s | Qunt Edge',
  },
  description: ROOT_DESCRIPTION,
  keywords: [
    'trading journal',
    'best trading journal',
    'trading analytics',
    'prop firm journal',
    'trading performance review',
    'Qunt Edge',
  ],
  alternates: {
    canonical: siteOrigin,
    languages: {
      'en-US': siteOrigin,
      'fr-FR': `${siteOrigin}/fr`,
    },
  },
  openGraph: {
    title: 'Qunt Edge',
    description: ROOT_DESCRIPTION,
    url: siteOrigin,
    siteName: 'Qunt Edge',
    type: 'website',
    locale: 'en-US',
    images: [
      {
        url: `${siteOrigin}/opengraph-image.webp`,
        width: 630,
        height: 315,
        alt: 'Qunt Edge Open Graph Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qunt Edge',
    description: ROOT_DESCRIPTION,
    images: [`${siteOrigin}/twitter-image.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: 'black' },
      {
        rel: 'android-chrome',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: { google: 'notranslate' },
  authors: [{ name: 'Qunt Edge Team' }],
  creator: 'Qunt Edge',
  publisher: 'Qunt Edge',
  formatDetection: { email: false, address: false, telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 10, // Increased for 12K scaling capability
  minimumScale: 0.1, // Allow zoom out for ultra-high-res content
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: 'var(--card)' },
    { media: '(prefers-color-scheme: light)', color: 'oklch(0.9838 0.0035 247.8583)' },
  ],
  // 12K-specific properties for high-DPI displays
  colorScheme: 'dark light',
  // Note: devicePixelRatio cannot be set directly in viewport,
  // but will be detected and handled by CSS media queries
}

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercelRuntime = process.env.VERCEL === '1'
  const enableVercelInsights = isProduction && isVercelRuntime
  const uiVariant = getUiVariant()
  const darkRootClass = shouldEnforceDarkOnlySurfaces() ? 'dark' : ''

  return (
    <html
      lang="en"
      className={`${darkRootClass} ${fontDmSans.variable} bg-background text-foreground`}
      data-ui-variant={uiVariant}
      translate="no"
      suppressHydrationWarning
      style={{ backgroundColor: 'var(--qe-ref-surface)', color: 'var(--qe-ref-text)' }}
    >
      <head>
        {/* Resource Hinting for Performance */}
        <link rel="dns-prefetch" href={siteOrigin} />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}

        {/* Mobile-First Meta Tags */}
        <meta name="theme-color" content="var(--card)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no, address=no, email=no" />
        <meta name="color-gamut" content="p3" />

        {/* Accessibility & SEO */}
        <meta name="google" content="notranslate" />
        <meta name="robots" content="index, follow" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="180x180"
          href="/apple-touch-icon-precomposed.png"
        />
      </head>
      <body
        className="flex min-h-screen flex-col bg-background font-sans type-body antialiased text-foreground"
        data-ui-variant={uiVariant}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
        >
          Skip to main content
        </a>
        <ScrollLockFixLazy />
        {enableVercelInsights ? <SpeedInsights /> : null}
        {enableVercelInsights ? <Analytics /> : null}
        <main id="main-content" className="flex flex-1 flex-col relative">
          {children}
        </main>
      </body>
    </html>
  )
}
