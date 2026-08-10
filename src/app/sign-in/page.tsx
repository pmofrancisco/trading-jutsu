import { toInternalPath } from '@/features/auth/callback-url';
import { getCurrentUser } from '@/features/auth/data/session';
import SignInForm from '@/features/auth/ui/sign-in-form';
import { redirect } from 'next/navigation';

interface SignInProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignIn({ searchParams }: SignInProps) {
  const { callbackUrl, error } = await searchParams;
  const destination = toInternalPath(callbackUrl);

  // Deliberately the same check `requireUser()` makes, so a session this page
  // considers valid cannot be bounced straight back here by the private layout.
  if (await getCurrentUser()) {
    redirect(destination);
  }

  return (
    <div className="p-6 border rounded-xl flex flex-col items-center gap-16 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <h1 className="text-2xl font-bold text-center">
        Sign in to Trading Jutsu
      </h1>
      {error === 'AccessDenied' && (
        <p className="text-center text-danger">
          That GitHub account does not have access to this app.
        </p>
      )}
      <SignInForm callbackUrl={destination} />
    </div>
  );
}
