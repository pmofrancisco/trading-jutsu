import { gutter } from '@/components/container';
import Header from '@/components/header';
import { requireUser } from '@/features/auth/data/session';
import type { Metadata } from 'next';

/**
 * Defence in depth, not the reason these pages stay unindexed — `proxy.ts`
 * turns a crawler away long before it renders one. This keeps them out of the
 * index anyway if that gate is ever loosened. Metadata in a segment overrides
 * the same field in the root layout.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Wraps every route that requires a signed-in user. Layouts do not re-render on
 * client-side navigation, so this is not the authorization boundary — it exists
 * to resolve the user for `<Header />` and to keep a signed-out visitor from
 * reaching routes that fetch nothing. `proxy.ts` filters those requests first,
 * and each data function calls `requireUser()` for itself.
 */
export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <>
      <Header user={user} />
      {/* The landmark that pairs with the `<header>` and `<nav>` inside it, so
       * a screen reader can skip straight to the page's own content.
       *
       * `gutter` rather than a padding of its own: the header runs on it too,
       * and a page whose content started 8px inside the mark above it would
       * read as two panels stacked rather than one column. */}
      <main className={`${gutter} py-4`}>{children}</main>
    </>
  );
}
