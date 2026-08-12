import Mark from '@/components/mark';
import ThemeSwitch from '@/components/theme-switch';

/**
 * The header for the one page a signed-out visitor can reach.
 *
 * Deliberately not `<Header />`: that one needs a `SessionUser`, and every
 * destination in it — the navigation, the account menu — would bounce a visitor
 * without a session straight back to the page they are already on. What is left
 * worth keeping is the mark and the theme switch, which is enough for the entry
 * page to read as part of the app rather than a screen of its own.
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
       * Plain text, not a link home: `proxy.ts` sends a signed-out visitor from
       * `/` to this page, so the only thing the link could do is reload what is
       * already on screen.
       */}
      <div className="flex items-center gap-2 px-2 py-1 font-bold tracking-tight">
        <Mark className="size-5 shrink-0 text-accent" />
        Trading Jutsu
      </div>
      <ThemeSwitch />
    </header>
  );
}
