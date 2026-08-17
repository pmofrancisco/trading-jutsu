import { getCurrentUser } from '@/features/auth/data/session';
import FinalCta from '@/features/marketing/ui/final-cta';
import Hero from '@/features/marketing/ui/hero';
import LandingHeader from '@/features/marketing/ui/landing-header';
import Pricing from '@/features/marketing/ui/pricing';
import Testimonials from '@/features/marketing/ui/testimonials';
import TradingSystems from '@/features/marketing/ui/trading-systems';
import { paths } from '@/paths';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * The site root, and one of the two routes a crawler can reach — see the note in
 * `sitemap.ts`. Only the canonical is set here: the title, description and Open
 * Graph fields in the root layout already describe this page, since it is the
 * page that layout's `openGraph.url` names.
 */
export const metadata: Metadata = {
  alternates: { canonical: paths.home() },
};

/**
 * The landing page a stranger sees, and the mirror of `sign-in`: each sends the
 * visitor it is not written for to the other side of the sign-in.
 *
 * It sits outside `(private)` — that group's layout calls `requireUser()`, which
 * would redirect the visitor this page exists to serve — so the header and the
 * `<main>` landmark that group provides are composed here instead.
 *
 * Composition only, per the note on `app/` in AGENTS.md: every band below is a
 * component in `features/marketing/ui`, and the order they appear in is the
 * argument the page makes — what it is, what it does, who says it works, what
 * it costs, and then the ask. Social proof deliberately sits *before* the
 * pricing, so the reader meets the numbers having already read someone else's
 * account of what they buy.
 *
 * Reading the session opts this route into dynamic rendering, which is
 * unavoidable: whether the page renders at all depends on who is asking.
 */
export default async function Home() {
  // Deliberately the same check `requireUser()` makes, so a session good enough
  // for the private routes is a session that never stops here. `getCurrentUser()`
  // rather than `requireUser()`: a null user is this page's whole audience, not
  // a reason to redirect.
  //
  // The check belongs here and not in `proxy.ts`, which only looks for the
  // presence of a session cookie: a stale or revoked one would send its owner to
  // `/dashboard`, and from there to `/sign-in?callbackUrl=/dashboard` — the
  // wrong destination, arrived at by way of a page they were never shown.
  //
  // `redirect()` answers with a 307. A permanent one would be cached by the
  // browser and strand the same visitor on `/dashboard` after they signed out.
  if (await getCurrentUser()) {
    redirect(paths.dashboard());
  }

  return (
    <>
      {/* `LandingHeader` unconditionally: past the redirect above, nobody
       * reading this page has a session for `<Header />` to render. */}
      <LandingHeader />
      {/* The landmark that pairs with the `<header>` and `<nav>` inside it, so
       * a screen reader can skip straight to the page's own content. No padding
       * of its own, unlike `(private)/layout`: each band below runs edge to edge
       * and sets its own gutter, so that a section's background and its top rule
       * reach the sides of the viewport. */}
      <main>
        <Hero />
        <TradingSystems />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
    </>
  );
}
