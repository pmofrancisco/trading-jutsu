import PublicHeader from '@/components/public-header';
import {
  CALLBACK_URL_COOKIE_NAMES,
  toInternalPath,
  toInternalPathFromUrl,
} from '@/features/auth/callback-url';
import { getCurrentUser } from '@/features/auth/data/session';
import { toSignInErrorMessage } from '@/features/auth/sign-in-error';
import SignInAlert from '@/features/auth/ui/sign-in-alert';
import SignInForm from '@/features/auth/ui/sign-in-form';
import { paths } from '@/paths';
import { Card, Typography } from '@heroui/react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * One of the two pages a crawler can reach — `/` is the other, and the one the
 * sitemap points at first. The canonical matters more here than usual:
 * `proxy.ts` sends visitors here with a `callbackUrl`, and Auth.js with an
 * `error`, so the same page is reachable at many query strings that would
 * otherwise be indexed separately.
 */
export const metadata: Metadata = {
  title: 'Sign in',
  // Echoes the root layout's description — the landing page sells the systems,
  // and a visitor arriving here from one of its calls to action should not be
  // told they are signing in to something else.
  description:
    'Sign in to Trading Jutsu — rule-based trading systems for Philippine and US equities, crypto and forex.',
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

/**
 * Where to send the visitor once they are signed in.
 *
 * `proxy.ts` names the requested path in `?callbackUrl=`, but Auth.js drops the
 * parameter when it bounces a failed attempt back here — so on the retry only
 * Auth.js's own cookie still remembers. Reading it back is what stops a
 * rejected sign-in from quietly resetting the destination to the home page.
 *
 * The parameter still wins where both exist: it describes this request, while
 * the cookie may be left over from an earlier one.
 */
async function resolveDestination(callbackUrl: string | undefined) {
  if (callbackUrl !== undefined) {
    return toInternalPath(callbackUrl);
  }

  const cookieStore = await cookies();
  const stored = CALLBACK_URL_COOKIE_NAMES.map(
    (name) => cookieStore.get(name)?.value,
  ).find(Boolean);

  return toInternalPathFromUrl(stored);
}

export default async function SignIn({ searchParams }: SignInProps) {
  const { callbackUrl, error } = await searchParams;
  const destination = await resolveDestination(callbackUrl);
  const errorMessage = toSignInErrorMessage(error);

  // Deliberately the same check `requireUser()` makes, so a session this page
  // considers valid cannot be bounced straight back here by the private layout.
  if (await getCurrentUser()) {
    redirect(destination);
  }

  return (
    <>
      <PublicHeader />
      {/*
       * `flex-1` fills what is left of the column the root layout's `<body>`
       * establishes, so the card centres against the header without
       * `position: fixed` — it can still scroll and keep its padding when the
       * viewport is too short to hold it.
       *
       * `<main>` rather than a bare `<div>`: this is the only page outside
       * `(private)/layout`, which is where the app's other `<main>` lives, so
       * without it the one page a stranger can reach has no landmarks at all.
       */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-sm">
          <Card.Header className="gap-2">
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
            {/*
             * The on-page counterpart to this route's meta description, and the
             * same words the landing page's hero uses. A visitor who clicked
             * "Start free as a Genin" should recognise what they arrived at;
             * describing it differently here reads as a different product.
             */}
            <Typography.Paragraph align="center" color="muted" size="sm">
              Rule-based trading systems — trend following, momentum, mean
              reversion and more — for Philippine and US equities, crypto and
              forex.
            </Typography.Paragraph>
          </Card.Header>
          <Card.Content className="gap-4">
            {errorMessage && <SignInAlert message={errorMessage} />}
            <SignInForm callbackUrl={destination} />
          </Card.Content>
          {/*
           * A footer behind a rule rather than a fourth line of the card's
           * content: it is fine print about who may sign in, not another step in
           * signing in, and set directly under the button it read as a caption
           * belonging to it.
           */}
          <Card.Footer className="border-t border-t-border pt-4">
            {/*
             * Says up front what the `AccessDenied` alert would otherwise say
             * only after the visitor has handed over their GitHub account.
             *
             * It has to stay, and it has to stay honest: `lib/auth.ts` allows a
             * single `ADMIN_EMAIL` and turns every other account away, so copy
             * promising the free rank on the landing page would send a stranger
             * through a GitHub authorization that cannot succeed. What it does
             * do is name the ranks, so the reader who clicked "Start free as a
             * Genin" learns why they cannot have one yet rather than concluding
             * the button was broken.
             *
             * Delete this line when the allowlist goes — not before.
             */}
            {/* `flex-1`: `Card.Footer` is a flex row, so without it the
             * paragraph shrinks to its longest line and `align="center"` centres
             * the text inside a box that is no longer the card's width. */}
            <Typography.Paragraph
              align="center"
              className="flex-1"
              color="muted"
              size="xs"
            >
              Trading Jutsu is in closed early access: sign-in is limited to
              approved GitHub accounts. Genin, Chunin and Jonin open to everyone
              at launch.
            </Typography.Paragraph>
          </Card.Footer>
        </Card>
      </main>
    </>
  );
}
