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
    /*
     * `primary`, not `outline`: this is the only thing there is to do on the
     * page, and an outline button on the card's surface reads as the quieter of
     * two options when there is no other option. It is also the same button the
     * landing page's "Start free as a Genin" promised — a visitor who followed a
     * filled accent button should arrive at one.
     *
     * `lg` for its height rather than its emphasis, exactly as in the header:
     * it is the only HeroUI size that clears 44px on a touch screen (`h-11`,
     * dropping to `h-10` from `md` up, where a mouse does not need the margin).
     */
    <Button
      className="w-full"
      isPending={pending}
      size="lg"
      type="submit"
      variant="primary"
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
