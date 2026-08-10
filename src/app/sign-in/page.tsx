import { toInternalPath } from '@/features/auth/callback-url';
import { getCurrentUser } from '@/features/auth/data/session';
import SignInForm from '@/features/auth/ui/sign-in-form';
import { Alert, Card } from '@heroui/react';
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
    // `flex-1` fills the column the root layout's `<body>` already establishes,
    // so the card centres without `position: fixed` — it can still scroll and
    // keep its padding when the viewport is too short to hold it.
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <Card.Header>
          {/*
           * A plain `<h1>` rather than `Card.Title`: the title is this page's
           * only heading, and `Card.Title` renders an `<h3>`. Overriding that
           * takes its `render` prop — a function, which a Server Component
           * cannot hand to a client component like `Card`.
           */}
          <h1 className="text-2xl font-bold text-center">
            Sign in to Trading Jutsu
          </h1>
        </Card.Header>
        <Card.Content className="gap-4">
          {error === 'AccessDenied' && (
            <Alert status="danger">
              {/* Empty — the indicator falls back to the built-in danger icon. */}
              <Alert.Indicator />
              <Alert.Content>
                {/* `Alert.Title`, not `Description`: only the title slot takes
                 * the status colour; descriptions render muted. */}
                <Alert.Title>
                  That GitHub account does not have access to this app.
                </Alert.Title>
              </Alert.Content>
            </Alert>
          )}
          <SignInForm callbackUrl={destination} />
        </Card.Content>
      </Card>
    </div>
  );
}
