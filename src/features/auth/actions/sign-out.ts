'use server';

import { signOut as nextAuthSignOut } from '@/lib/auth';
import { paths } from '@/paths';

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirectTo: paths.signIn() });
}
