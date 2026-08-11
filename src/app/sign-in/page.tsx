import { toInternalPath } from '@/features/auth/callback-url';
import { getCurrentUser } from '@/features/auth/data/session';
import SignInForm from '@/features/auth/ui/sign-in-form';
import { paths } from '@/paths';
import { Alert, Card, Typography } from '@heroui/react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * The only page a crawler can reach, so this is the entry Google will show for
 * the site. The canonical matters more than usual: `proxy.ts` sends visitors
 * here with a `callbackUrl`, and Auth.js with an `error`, so the same page is
 * reachable at many query strings that would otherwise be indexed separately.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to Trading Jutsu, a personal markets dashboard for Philippine Stock Exchange indices, crypto and forex.',
  alternates: { canonical: paths.signIn() },
  // `url` overrides the root layout's site-root URL so the link preview and the
  // canonical above name the same page rather than disagreeing. `type` and
  // `siteName` are repeated because a nested metadata field *replaces* the
  // parent segment's object outright instead of merging into it — without them
  // this page would ship no `og:type` or `og:site_name` at all. (`title` and
  // `description` are the exception: Next backfills those from the page's own.)
  openGraph: {
    type: 'website',
    siteName: 'Trading Jutsu',
    url: paths.signIn(),
  },
};

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
           * `Typography.Heading` rather than `Card.Title`: the title is this
           * page's only heading, and `Card.Title` is hard-wired to an `<h3>` —
           * the sole override is its `render` prop, a function, which a Server
           * Component cannot hand to a client component like `Card`. `level`
           * takes a plain number, so it survives the server/client boundary.
           *
           * `text-2xl` because `level` drives both the element and the scale,
           * and the stock `h1` size (`text-4xl`) wraps to three lines in a
           * `max-w-sm` card. Tailwind's `utilities` layer outranks the
           * `components` layer HeroUI styles the heading from, so it wins.
           */}
          <Typography.Heading
            align="center"
            className="text-2xl"
            level={1}
            weight="bold"
          >
            Sign in to Trading Jutsu
          </Typography.Heading>
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
