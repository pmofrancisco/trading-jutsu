import 'server-only';

import { paths } from '@/paths';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

/**
 * The whole allowlist: this app has exactly one user. Read at call time rather
 * than at module scope so a missing value fails the check instead of crashing
 * the build.
 */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;

  return Boolean(adminEmail) && email === adminEmail;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Credentials come from AUTH_GITHUB_ID / AUTH_GITHUB_SECRET.
  providers: [GitHub],
  pages: {
    signIn: paths.signIn(),
    // Sends `AccessDenied` back to our own page instead of Auth.js's default
    // error screen at /api/auth/error.
    error: paths.signIn(),
  },
  callbacks: {
    // Turns away a non-allowlisted account at the door. This is not the
    // authorization boundary — `requireUser()` re-checks on every request, so
    // an already-issued token cannot outlive its access.
    signIn: ({ user }) => isAllowedEmail(user.email),
  },
});
