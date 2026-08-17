import Mark from '@/components/mark';
import ThemeSwitch from '@/components/theme-switch';
import CtaLink from '@/features/marketing/ui/cta-link';
import { container, sectionIds } from '@/features/marketing/ui/section';
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
 * The landing page's header, and deliberately not `PublicHeader`.
 *
 * The two serve the same signed-out visitor but not the same page. `/sign-in`
 * is a single card with nowhere to go, so its header is a mark and a theme
 * switch and nothing that would only lead back to where the visitor already is.
 * This page is long, sells something, and has one thing it wants the visitor to
 * do — so it carries section links and a persistent "Sign in", which is exactly
 * what `PublicHeader` has no business rendering on the sign-in page itself.
 *
 * Sticky, unlike `PublicHeader`: this page is several screens tall, and the
 * pricing link and the sign-in button should not scroll away with the hero.
 * `backdrop-blur` with a translucent background so the content passing beneath
 * reads as passing beneath rather than colliding with it; `bg-background/85`
 * still covers text on browsers with no `backdrop-filter`.
 *
 * A Server Component: only `ThemeSwitch` needs the client, and it brings its own
 * boundary.
 */
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-b-border bg-background/85 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between`}>
        {/*
         * Plain text, not a link: on `/` it would only reload the page it is
         * already on. The signed-in header points the same mark at the
         * dashboard instead.
         */}
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <Mark className="size-5 shrink-0" />
          Trading Jutsu
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {/*
           * `hidden`/`display: none` below `sm` takes these out of the
           * accessibility tree as well as the layout — a burger menu for three
           * anchors on a page that scrolls past all three anyway would be a
           * control to open and close for nothing.
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
           * `lg` for its height, not its emphasis: it is the only size HeroUI
           * gives that clears 44px on a touch screen (`h-11`, dropping to
           * `h-10` from `md` up, where a mouse does not need the margin). The
           * header's row is 64px, so it still sits with air above and below.
           */}
          <CtaLink href={paths.signIn()} size="lg">
            Sign in
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
