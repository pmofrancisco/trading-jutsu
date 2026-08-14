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
  home: () => '/',
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
