import Header from '@/components/header';
import PublicHeader from '@/components/public-header';
import { getCurrentUser } from '@/features/auth/data/session';
import { paths } from '@/paths';
import type { Metadata } from 'next';

/**
 * The site root, and now one of the two routes a crawler can reach — see the
 * note in `sitemap.ts`. Only the canonical is set here: the title, description
 * and Open Graph fields in the root layout already describe this page, since it
 * is the page that layout's `openGraph.url` names.
 */
export const metadata: Metadata = {
  alternates: { canonical: paths.home() },
};

/**
 * The one page in the app that renders for a visitor with or without a session,
 * so it is also the one page that has to choose its own header.
 *
 * It sits outside `(private)` — that group's layout calls `requireUser()`, which
 * would redirect the visitor this page exists to serve — so the header and the
 * `<main>` landmark that group provides are composed here instead.
 *
 * `getCurrentUser()` rather than `requireUser()`: a null user is the expected
 * case, not a reason to redirect. Reading the session opts this route into
 * dynamic rendering, which is unavoidable — the two visitors get different
 * headers, so there is no one version of this page to prerender.
 */
export default async function Home() {
  // Deliberately the same check `requireUser()` makes, so a session good enough
  // for the private routes is a session good enough for the full header.
  const user = await getCurrentUser();

  return (
    <>
      {/*
       * A signed-in visitor keeps the navigation and the account menu they have
       * everywhere else; `<Header />` needs a `SessionUser`, and `PublicHeader`
       * is what is left of it once there is no session to render.
       */}
      {user ? <Header user={user} /> : <PublicHeader />}
      {/* The landmark that pairs with the `<header>` and `<nav>` inside it, so
       * a screen reader can skip straight to the page's own content. Matches
       * `(private)/layout` so the page does not shift when the header does. */}
      <main className="p-4">
        <div>Home Page</div>
      </main>
    </>
  );
}
