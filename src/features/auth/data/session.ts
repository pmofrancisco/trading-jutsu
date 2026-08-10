import 'server-only';

import { auth, isAllowedEmail } from '@/lib/auth';
import { paths } from '@/paths';
import { redirect } from 'next/navigation';
import { cache } from 'react';

/**
 * The only shape of the signed-in user that may cross into the render context.
 * Deliberately narrower than NextAuth's `Session['user']`.
 */
export interface SessionUser {
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Memoized for the duration of a request so every data function can ask for the
 * user independently instead of threading it through props.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const user = session?.user;

  // Re-checking the allowlist here — and not only in the `signIn` callback —
  // is what makes revoking access take effect on the next request rather than
  // whenever the JWT happens to expire.
  if (!user?.email || !isAllowedEmail(user.email)) {
    return null;
  }

  return {
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  };
});

/**
 * The authorization gate for every data function. Server Actions are reachable
 * by direct POST, so this must be called inside the data layer itself and not
 * only from the layout that renders the UI.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(paths.signIn());
  }

  return user;
}
