import { absoluteUrl, paths } from '@/paths';
import type { MetadataRoute } from 'next';

/**
 * The sign-in page is the only entry: it is the one route that answers a
 * request without a session with a 200 rather than a redirect, so it is the
 * only URL Google can actually index.
 *
 * No `lastModified` — the only honest value would be the build date, which
 * changes on every deploy and would tell crawlers the page had been rewritten
 * each time it had not.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(paths.signIn()),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
