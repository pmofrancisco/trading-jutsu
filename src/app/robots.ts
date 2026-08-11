import { absoluteUrl } from '@/paths';
import type { MetadataRoute } from 'next';

/**
 * The private routes are deliberately *not* listed as `disallow` entries.
 * `proxy.ts` already redirects every one of them to the sign-in page for a
 * visitor without a session, so a crawler can never index them anyway — and
 * `robots.txt` is public, so naming them here would only publish a list of the
 * app's routes in exchange for nothing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
