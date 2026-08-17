import { paths } from '@/paths';

/**
 * Whether a path leads to `route`, whatever query string trails it.
 *
 * Matched exactly, or up to the `?` — never by prefix. A prefix test would sweep
 * a later route such as `/sign-in-help` in with `/sign-in`, and for `/` it would
 * match the entire app.
 */
function isPath(route: string, path: string): boolean {
  return path === route || path.startsWith(`${route}?`);
}

/**
 * Narrows an untrusted `callbackUrl` down to a path inside this app, falling
 * back to the dashboard.
 *
 * The value reaches us through the query string and a hidden form field, so it
 * is attacker-controlled: without this, a crafted sign-in link could bounce the
 * user to another origin after authenticating. `//evil.com` and `/\evil.com`
 * are rejected too — browsers read both as protocol-relative URLs.
 *
 * The two public pages are rejected as destinations, query string and all. What
 * this function returns is where somebody goes *after* signing in, and neither
 * page will hold them once they have: `sign-in/page` redirects an authenticated
 * visitor onward, and so does `app/page`. Either value therefore describes the
 * same journey — a page that only forwards them to the dashboard the fallback
 * would have named outright, one wasted round trip later.
 *
 * Ordinary use produces both. Signing out leaves `/sign-in` in Auth.js's
 * callback cookie, which `toInternalPathFromUrl` reads back; `/` is what that
 * cookie holds whenever Auth.js fell back to the bare site origin, whose
 * pathname is exactly that.
 */
export function toInternalPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return paths.dashboard();
  }

  if (value.startsWith('//') || value.startsWith('/\\')) {
    return paths.dashboard();
  }

  if (isPath(paths.signIn(), value) || isPath(paths.home(), value)) {
    return paths.dashboard();
  }

  return value;
}

/**
 * The cookie Auth.js keeps the pending callback URL in, with and without the
 * `__Secure-` prefix it gains once cookies are issued over HTTPS — the same
 * pair `proxy.ts` looks for on the session cookie.
 */
export const CALLBACK_URL_COOKIE_NAMES = [
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
];

/**
 * The same narrowing as `toInternalPath`, for the absolute URL Auth.js stores
 * in the cookie above.
 *
 * Auth.js drops the `callbackUrl` query parameter when it sends a failed
 * sign-in back to our page, so on the retry that cookie is the only surviving
 * record of where the visitor was headed. Keeping the path and discarding the
 * origin is what makes an unexpected value harmless: whatever host the URL
 * names, only what sits below it survives, and `toInternalPath` still rejects
 * the remainder if it reads as protocol-relative.
 */
export function toInternalPathFromUrl(value: unknown): string {
  if (typeof value !== 'string') {
    return paths.dashboard();
  }

  try {
    const { pathname, search } = new URL(value);

    return toInternalPath(`${pathname}${search}`);
  } catch {
    // Not an absolute URL, so there is no path in it to trust.
    return paths.dashboard();
  }
}
