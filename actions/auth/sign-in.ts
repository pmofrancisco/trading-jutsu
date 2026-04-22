'use server';

import { signIn as nextAuthSignIn } from '@/auth';

export async function signIn() {
  await nextAuthSignIn('github');
  return {};
}
