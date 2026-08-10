'use client';

import { signIn } from '@/features/auth/actions/sign-in';
import { LogoGithub } from '@gravity-ui/icons';
import { Button, Spinner } from '@heroui/react';
import { useFormStatus } from 'react-dom';

/**
 * Split out because `useFormStatus` only reports on a `<form>` above it in the
 * tree. The action never returns — it redirects to GitHub — so there is no form
 * state to track with `useActionState`.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      isPending={pending}
      type="submit"
      variant="outline"
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : <LogoGithub />}
          {isPending ? 'Signing in...' : 'Sign in with GitHub'}
        </>
      )}
    </Button>
  );
}

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  return (
    <form action={signIn} className="w-full">
      <input type="hidden" name="callback-url" value={callbackUrl} />
      <SubmitButton />
    </form>
  );
}
