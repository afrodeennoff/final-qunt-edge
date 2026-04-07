// Utility to determine theme class based on the current route/path
// Exports a function that can be used on both server and client sides to
// decide between light and dark themes for a given pathname.

export type ThemeClass = 'light' | 'dark';
export type RouteCategory =
  | 'public'
  | 'auth'
  | 'dashboard'
  | 'admin'
  | 'teams'
  | 'embed'
  | 'shared'
  | 'home'
  | 'landing';

/**
 * Guess the theme class for a given URL pathname.
 * Heuristic:
 * - Public routes (home, landing, embed, shared, root) -> light
 * - Authenticated areas (dashboard, admin, teams, authentication) -> dark
 * - Fallback to dark to be safe for unknown/private routes
 */
export function getThemeClassForPathname(pathname: string): ThemeClass {
  if (!pathname) return 'dark';
  const path = pathname.toLowerCase();

  // Remove locale prefix if present (e.g. /en, /fr)
  const withoutLocale = path.replace(/^\/(en|fr)(?:\/)?/, '/');
  const segments = withoutLocale.split('/').filter(Boolean);

  const first = segments[0] ?? '';

  // Public routes: root, home, landing, embed, shared
  const isPublic = (
    first === '' ||
    first === 'home' ||
    first === 'landing' ||
    first === 'embed' ||
    first === 'shared'
  );
  if (isPublic) return 'light';

  // Authenticated areas
  const isAuth = (
    first === 'dashboard' ||
    first === 'admin' ||
    first === 'teams' ||
    first === 'authentication' ||
    first === 'auth'
  );
  if (isAuth) return 'dark';

  // Fallback: dark to avoid leaking private UI
  return 'dark';
}

// Convenience: export a default which maps to a CSS class for a given URL
export function getThemeClass(pathname: string): ThemeClass {
  return getThemeClassForPathname(pathname);
}
