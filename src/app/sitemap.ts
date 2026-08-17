import { absoluteUrl, paths } from '@/paths';
import type { MetadataRoute } from 'next';

/**
 * The two entries here are the two routes that answer a request without a
 * session with a 200 rather than a redirect — `PUBLIC_PATHS` in `proxy.ts` — so
 * they are the only URLs Google can actually index.
 *
 * Home outranks sign-in: both are reachable, but home is the page that describes
 * the site, and sign-in is a form. Left at equal priority they would compete to
 * be the result shown for the site.
 *
 * No `lastModified` — the only honest value would be the build date, which
 * changes on every deploy and would tell crawlers the page had been rewritten
 * each time it had not.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(paths.home()),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: absoluteUrl(paths.signIn()),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
