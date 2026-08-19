import SiteHeader from '@/components/site-header';
import ThemeSwitch from '@/components/theme-switch';
import CtaLink from '@/features/marketing/ui/cta-link';
import { sectionIds } from '@/features/marketing/ui/section';
import { paths } from '@/paths';

/**
 * The in-page navigation, in render order. Fragments rather than routes: the
 * landing page is one document, and every destination here is a band further
 * down it. `sectionIds` is the single spelling of each — see the note there.
 */
const sectionLinks = [
  { id: sectionIds.systems, label: 'Systems' },
  { id: sectionIds.testimonials, label: 'Testimonials' },
  { id: sectionIds.pricing, label: 'Pricing' },
];

/**
 * The landing page's header: `SiteHeader`'s bar — the same one `/sign-in`
 * wears, down to the height and the gutter — filled with what this page needs
 * and the sign-in page does not.
 *
 * It is long, it sells something, and it has one thing it wants the visitor to
 * do, so it carries section links and a persistent "Sign in". Neither belongs on
 * the sign-in page, which is a single card with nowhere to go and no reason to
 * offer a button leading back to itself. No `brandHref`, for the same kind of
 * reason: on `/` the mark would only reload the page it is already on.
 *
 * A Server Component: only `ThemeSwitch` needs the client, and it brings its own
 * boundary.
 */
export default function LandingHeader() {
  return (
    <SiteHeader>
      {/*
       * `hidden`/`display: none` below `sm` takes these out of the
       * accessibility tree as well as the layout — a burger menu for three
       * anchors on a page that scrolls past all three anyway would be a control
       * to open and close for nothing.
       */}
      <nav aria-label="Sections" className="hidden sm:block">
        <ul className="flex items-center gap-1">
          {sectionLinks.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="block rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:status-focused"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeSwitch />
      {/*
       * `lg` for its height, not its emphasis: it is the only size HeroUI gives
       * that clears 44px on a touch screen (`h-11`, dropping to `h-10` from `md`
       * up, where a mouse does not need the margin). The header's row is 64px,
       * so it still sits with air above and below.
       */}
      <CtaLink href={paths.signIn()} size="lg">
        Sign in
      </CtaLink>
    </SiteHeader>
  );
}
