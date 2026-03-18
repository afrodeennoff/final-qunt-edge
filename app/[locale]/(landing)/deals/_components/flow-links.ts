export type FlowLink = {
  path: string
  label: string
}

export const FLOW_LINKS: FlowLink[] = [
  { path: '/deals', label: 'Deals' },
  { path: '/deals/compare', label: 'Matchup' },
  { path: '/deals/guides', label: 'Playbooks' },
  { path: '/deals/calculator', label: 'Cost Planner' },
  { path: '/deals/faq', label: 'Help' },
]

export function isFlowLinkActive(pathname: string, href: string): boolean {
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/i, '')
  const normalizedHref = href.split('#')[0]

  if (!normalizedPathname) return normalizedHref === '/deals'

  if (href === '/deals') {
    return normalizedPathname === '/deals' || normalizedPathname.startsWith('/deals/')
  }

  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`)
}
