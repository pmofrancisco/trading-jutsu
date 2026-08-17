import Mark from '@/components/mark';
import ThemeSwitch from '@/components/theme-switch';

/**
 * The header for a visitor without a session — the sign-in page and `/`, the
 * two routes that render for nobody else, since each redirects a signed-in
 * visitor onward.
 *
 * Deliberately not `<Header />`: that one needs a `SessionUser`, and every
 * destination in it — the navigation, the account menu — is behind the sign-in
 * this visitor has not completed, so `proxy.ts` would bounce them off any of
 * them. What is left worth keeping is the mark and the theme switch, which is
 * enough for these pages to read as part of the app rather than screens of
 * their own.
 *
 * A Server Component: only `ThemeSwitch` needs the client, and it brings its own
 * boundary.
 */
export default function PublicHeader() {
  return (
    // No `sticky`: this sits above a card that is centred in the viewport, so
    // there is nothing to scroll past it and nothing showing through it.
    <header className="flex items-center justify-between border-b border-b-border p-2">
      {/*
       * Plain text, not a link. On `/` it would only reload the page it is
       * already on, and nothing else in the app links to `/` either — the
       * signed-in header points the same mark at the dashboard instead.
       */}
      <div className="flex items-center gap-2 px-2 py-1 font-bold tracking-tight">
        <Mark className="size-5 shrink-0" />
        Trading Jutsu
      </div>
      <ThemeSwitch />
    </header>
  );
}
