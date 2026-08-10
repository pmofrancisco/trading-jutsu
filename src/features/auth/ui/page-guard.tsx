'use client';

import { useSession } from 'next-auth/react';
import SignInButton from './sign-in-button';

/**
 * Presentation only: swaps the app shell for a sign-in prompt. This is not an
 * authorization boundary — every data function enforces access on the server
 * via `requireUser()`.
 */
export default function PageGuard({ children }: { children: React.ReactNode }) {
  const session = useSession();

  return (
    <>
      {session?.data?.user ? (
        <>{children}</>
      ) : (
        <div className="p-6 border rounded-xl flex flex-col items-center gap-16 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-2xl font-bold text-center">
            Sign in to Trading Jutsu
          </h1>
          <SignInButton />
        </div>
      )}
    </>
  );
}
