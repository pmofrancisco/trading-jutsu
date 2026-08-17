/**
 * The canonical production origin. Hardcoded rather than read from the
 * environment on purpose: canonical URLs, `sitemap.xml` and `robots.txt` must
 * name production wherever the build runs, or a preview deployment would
 * advertise itself to Google as the real site and compete with it.
 */
export const origin = 'https://www.trading-jutsu.com';

/** Lifts a path from `paths` into the absolute URL crawlers need. */
export function absoluteUrl(path: string): string {
  return new URL(path, origin).toString();
}

export const paths = {
  /**
   * The public landing page. Along with `signIn`, one of the two routes a
   * visitor without a session can read — see `PUBLIC_PATHS` in `proxy.ts`.
   */
  home: () => '/',
  /**
   * Where a signed-in visitor lands, and the app's root as far as the navigation
   * is concerned: nothing in the header links to `home`, because the header only
   * renders for someone who is already past it.
   */
  dashboard: () => '/dashboard',
  signIn: () => '/sign-in',
  crypto: {
    index: () => '/crypto',
  },
  forex: {
    index: () => '/forex',
  },
  phStocks: {
    index: () => '/ph-stocks',
    indicesPerformance: () => '/ph-stocks/indices-performance',
  },
};
