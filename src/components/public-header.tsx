import SiteHeader from '@/components/site-header';
import ThemeSwitch from '@/components/theme-switch';
import { paths } from '@/paths';

/**
 * The header for the sign-in page — one of the two routes that render for a
 * visitor without a session, since each redirects a signed-in visitor onward.
 * `/` is the other, and carries the same bar with more in it: see
 * `LandingHeader`, which adds the section links and the "Sign in" button that
 * would only lead back here from here.
 *
 * Deliberately not `<Header />`: that one needs a `SessionUser`, and every
 * destination in it — the navigation, the account menu — is behind the sign-in
 * this visitor has not completed, so `proxy.ts` would bounce them off any of
 * them. What is left worth keeping is the mark and the theme switch.
 *
 * The mark is a link here, and is not on the landing page, because here it is
 * the page's only way out. A visitor who arrived from one of the landing page's
 * calls to action and wants to read the pricing again should not have to reach
 * for the back button — a sign-in screen whose every other control hands an
 * account to a third party is exactly where a stranger is most likely to want
 * to go back and check something first.
 *
 * A Server Component: only `ThemeSwitch` needs the client, and it brings its own
 * boundary.
 */
export default function PublicHeader() {
  return (
    <SiteHeader brandHref={paths.home()}>
      <ThemeSwitch />
    </SiteHeader>
  );
}
