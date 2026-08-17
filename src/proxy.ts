import { paths } from '@/paths';
import { NextResponse, type NextRequest } from 'next/server';

/** Auth.js gains the `__Secure-` prefix once it is issuing cookies over HTTPS. */
const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

/**
 * The routes that answer a request without a session with a 200 rather than a
 * redirect. Matched exactly: every path below either of these is private, and a
 * prefix test on `/` would let the whole app through.
 *
 * These are also exactly the URLs a crawler can index — see `sitemap.ts`.
 */
const PUBLIC_PATHS = [paths.home(), paths.signIn()];

/**
 * An optimistic gate: it only looks for the presence of a session cookie, never
 * at its contents. That keeps it cheap enough to run on every request —
 * including prefetches — and it is not a security boundary. The real checks
 * happen in `requireUser()`, which every data function calls.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const signInUrl = new URL(paths.signIn(), request.url);
  signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // `/api/auth` is excluded because the OAuth callback arrives before the
  // session cookie exists — proxying it would break sign-in itself.
  //
  // `icon`, `robots.txt` and `sitemap.xml` are excluded because the client
  // asking for them carries no session cookie: without this they would be
  // redirected to the sign-in page like any other request, and Google would
  // never read any of them. `icon` is the generated favicon route (`app/
  // icon.tsx`) — a browser fetches it before there is a session, on the
  // sign-in page itself.
  matcher: [
    '/((?!api/auth|_next/static|_next/image|icon|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
