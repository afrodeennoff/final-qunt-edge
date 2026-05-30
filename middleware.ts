export { proxy as middleware } from './proxy'

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - opengraph-image (Open Graph image generation)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|.*\\..*).*)',
  ],
}
