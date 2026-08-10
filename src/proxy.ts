import { paths } from '@/paths';
import { NextResponse, type NextRequest } from 'next/server';

/** Auth.js gains the `__Secure-` prefix once it is issuing cookies over HTTPS. */
const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

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

  if (pathname === paths.signIn()) {
    return NextResponse.next();
  }

  const signInUrl = new URL(paths.signIn(), request.url);
  signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // `/api/auth` is excluded because the OAuth callback arrives before the
  // session cookie exists — proxying it would break sign-in itself.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
