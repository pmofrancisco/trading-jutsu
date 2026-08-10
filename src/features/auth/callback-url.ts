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
