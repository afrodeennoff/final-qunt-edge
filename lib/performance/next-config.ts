import type { NextConfig } from "next";
import path from "node:path";

export type OptimizedNextConfigResult = {
  config: NextConfig;
  warnings: string[];
};

function parseBuildCpus(rawValue: string | undefined, warnings: string[]): number | undefined {
  if (!rawValue) return undefined;
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    warnings.push(`Invalid NEXT_BUILD_CPUS value \"${rawValue}\". Falling back to Next.js default.`);
    return undefined;
  }
  return Math.floor(parsedValue);
}

function getImageHosts(cdnUrl: string | undefined, supabaseUrl: string | undefined, warnings: string[]): string[] {
  const hosts = new Set<string>();

  if (cdnUrl) {
    try {
      hosts.add(new URL(cdnUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_CDN_URL value \"${cdnUrl}\". Ignoring it.`);
    }
  }

  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      warnings.push(`Invalid NEXT_PUBLIC_SUPABASE_URL value \"${supabaseUrl}\". Ignoring it.`);
    }
  }

  hosts.add("images.unsplash.com");
  hosts.add("avatars.githubusercontent.com");

  return Array.from(hosts);
}

export function createOptimizedNextConfig(): OptimizedNextConfigResult {
  const warnings: string[] = [];
  const cpus = parseBuildCpus(process.env.NEXT_BUILD_CPUS, warnings);
  const imageHosts = getImageHosts(process.env.NEXT_PUBLIC_CDN_URL, process.env.NEXT_PUBLIC_SUPABASE_URL, warnings);
  const projectRoot = path.resolve(process.cwd());

  const config: NextConfig = {
    poweredByHeader: false,
    reactStrictMode: true,
    serverExternalPackages: ['pdf2json', 'canvas', 'sharp'],
    cacheComponents: true,
    // Bundle optimization - tree shake heavy libraries
    experimental: {
      ...(cpus ? { cpus } : {}),
      // Optimize package imports for better tree shaking
      // Each package below gets optimized module resolution + dead code elimination
      optimizePackageImports: [
        'recharts',
        '@tanstack/react-table',
        '@tanstack/react-query',
        'date-fns',
        'date-fns-tz',
        'lucide-react',
        'framer-motion',
        'decimal.js',
        // Form state — used in auth, admin, community pages
        'react-hook-form',
        // UI primitives — Dialog, Dropdown, Select, Popover used in 10+ components
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        '@radix-ui/react-popover',
        '@radix-ui/react-tooltip',
        // Drag-and-drop — dashboard widget canvas, accounts table
        '@dnd-kit/core',
        // CVA + tailwind-merge — used by every component with variants
        'class-variance-authority',
        'tailwind-merge',
        // Dashboard grid & zoom — used in widget canvas and chart viewers
        'react-grid-layout',
        'react-zoom-pan-pinch',
        'react-resizable',
        // Supabase — client libraries for auth and database
        '@supabase/supabase-js',
        '@supabase/ssr',
        // Data export/import — Excel, PDF, CSV generation and parsing
        'exceljs',
        'jspdf',
        'papaparse',
        // DOM manipulation — screenshot capture for exports
        'html2canvas',
        // State management — Zustand stores
        'zustand',
        // Visualization — D3 charts and data visualization
        'd3',
      ],
    },
    turbopack: {
      root: projectRoot,
    },
    outputFileTracingRoot: projectRoot,
    // Enable standalone output for better Docker deployment
    output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
    images: {
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 7,
      remotePatterns: imageHosts.map((hostname) => ({
        protocol: "https",
        hostname,
      })),
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      maximumRedirects: 0,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      qualities: [50, 65, 75, 85, 90],
    },
    // Reduce logging in production
    logging: {
      fetches: {
        fullUrl: process.env.NODE_ENV === 'development',
      },
    },
  };

  return { config, warnings };
}
