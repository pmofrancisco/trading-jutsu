import { paths } from '@/paths';

/**
 * Narrows an untrusted `callbackUrl` down to a path inside this app.
 *
 * The value reaches us through the query string and a hidden form field, so it
 * is attacker-controlled: without this, a crafted sign-in link could bounce the
 * user to another origin after authenticating. `//evil.com` and `/\evil.com`
 * are rejected too — browsers read both as protocol-relative URLs.
 */
export function toInternalPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return paths.home();
  }

  if (value.startsWith('//') || value.startsWith('/\\')) {
    return paths.home();
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
    return paths.home();
  }

  try {
    const { pathname, search } = new URL(value);

    return toInternalPath(`${pathname}${search}`);
  } catch {
    // Not an absolute URL, so there is no path in it to trust.
    return paths.home();
  }
}
