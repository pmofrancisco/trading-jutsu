'use server';

import { toInternalPath } from '@/features/auth/callback-url';
import { signIn as nextAuthSignIn } from '@/lib/auth';

export async function signIn(formData: FormData): Promise<void> {
  // Never returns: `nextAuthSignIn` throws a redirect to GitHub.
  await nextAuthSignIn('github', {
    redirectTo: toInternalPath(formData.get('callback-url')),
  });
}
