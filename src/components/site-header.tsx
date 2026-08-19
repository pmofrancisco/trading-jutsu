import { container } from '@/components/container';
import Mark from '@/components/mark';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** The wordmark's own styling, shared by both the link and the plain form. */
const brand = 'flex items-center gap-2 font-bold tracking-tight';

/**
 * The bar the two signed-out pages wear.
 *
 * `/` and `/sign-in` are the only routes a visitor without a session can read,
 * and one leads to the other — so the frame has to be the same on both, or the
 * mark jumps sideways and up the moment a call to action is clicked. It used to:
 * the landing page hung its header off `container` at `h-16`, and the sign-in
 * page had a `p-2` bar of its own that ran edge to edge. Same components, two
 * different bars. This is that frame, once, so the two cannot drift again.
 *
 * What differs between the pages is what sits *in* the bar, and that is all this
 * takes: `children` for the controls on the right, and `brandHref` for whether
 * the mark leads anywhere. Sticky on both, for the landing page's sake — it is
 * several screens tall, and the pricing link and the sign-in button should not
 * scroll away with the hero. `backdrop-blur` with a translucent background so
 * the content passing beneath reads as passing beneath rather than colliding
 * with it; `bg-background/85` still covers text on browsers with no
 * `backdrop-filter`.
 *
 * A Server Component: nothing here needs the client, and `ThemeSwitch` — the
 * one control that does — brings its own boundary.
 */
export default function SiteHeader({
  brandHref,
  children,
}: {
  /**
   * Where the mark leads, if anywhere. Omitted on the landing page, where it
   * would only reload the page the visitor is already on.
   */
  brandHref?: string;
  /** The controls on the right, in render order. */
  children: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-b-border bg-background/85 backdrop-blur">
      <div className={`${container} flex h-16 items-center justify-between`}>
        {brandHref ? (
          /*
           * `-mx-2` cancels the padding the hover background needs, so the mark
           * still starts on the container's own left edge — the linked and
           * unlinked forms have to sit in exactly the same place, since a
           * visitor moving between the two pages sees them as one bar that
           * stayed put.
           *
           * `focus-visible:status-focused` is the same ring HeroUI's controls
           * draw; a bare anchor gets none of a `Button`'s styling, so without it
           * this would be the only interactive element on the page with a
           * browser-default outline.
           */
          <Link
            href={brandHref}
            className={`${brand} -mx-2 rounded-md px-2 py-1 transition-colors hover:bg-surface-hover focus-visible:status-focused`}
          >
            <Mark className="size-5 shrink-0" />
            Trading Jutsu
          </Link>
        ) : (
          <div className={brand}>
            <Mark className="size-5 shrink-0" />
            Trading Jutsu
          </div>
        )}
        <div className="flex items-center gap-1 sm:gap-3">{children}</div>
      </div>
    </header>
  );
}
