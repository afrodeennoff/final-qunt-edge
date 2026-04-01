export const SIDEBAR_STATE_COOKIE_NAME = 'sidebar:state'
export const SIDEBAR_STATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function parseSidebarStateCookieValue(value: string | null | undefined): boolean {
  return value !== 'false'
}
