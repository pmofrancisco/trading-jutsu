'use server';

import { signIn as nextAuthSignIn } from '@/lib/auth';
import { paths } from '@/paths';

export async function signIn(): Promise<boolean> {
  await nextAuthSignIn('github', { redirectTo: paths.home() });
  return true;
}
