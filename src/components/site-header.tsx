import { container, gutter } from '@/components/container';
import Mark from '@/components/mark';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** The wordmark's own styling, shared by both the link and the plain form. */
const brand = 'flex items-center gap-2 font-bold tracking-tight';

/**
 * The bar every page in the app wears.
 *
 * It began as the signed-out frame alone. `/` and `/sign-in` are the only routes
 * a visitor without a session can read, and one leads to the other — so the
 * frame had to be the same on both, or the mark jumped sideways and up the
 * moment a call to action was clicked. It used to: the landing page hung its
 * header off `container` at `h-16`, and the sign-in page had a `p-2` bar of its
 * own that ran edge to edge.
 *
 * The signed-in bar had drifted the same way, and further — its own `p-2` row,
 * its own copy of the wordmark, its own hand-rolled focus ring — so it is drawn
 * from here too, through `Header`. Signing in should change what is in the bar,
 * not where the bar is: same height, same gutter, same mark in the same place.
 *
 * What differs between the pages is what sits *in* the bar, and that is all this
 * takes — one slot per region, plus `brandHref` for whether the mark leads
 * anywhere. Sticky everywhere: the landing page is several screens tall, and the
 * PH Stocks grid is taller than the viewport, and neither the pricing link nor
 * the navigation should scroll away. `backdrop-blur` with a translucent
 * background so the content passing beneath reads as passing beneath rather than
 * colliding with it; `bg-background/85` still covers text on browsers with no
 * `backdrop-filter`.
 *
 * Not marked `'use client'`: it renders as a Server Component on the signed-out
 * pages, and is pulled into the client bundle by `Header`, which needs the
 * client for its drawer. Nothing here minds either way — no state, no effects,
 * no server-only import.
 */
export default function SiteHeader({
  brandHref,
  children,
  fluid = false,
  nav,
  start,
}: {
  /**
   * Where the mark leads, if anywhere. Omitted on the landing page, where it
   * would only reload the page the visitor is already on.
   */
  brandHref?: string;
  /** The controls on the right, in render order. */
  children: ReactNode;
  /**
   * Run the row edge to edge on the app's gutter rather than centring it on
   * `container`. The signed-in pages are full-bleed — a four-column grid of
   * index cards uses every pixel it is given — so their bar has to be too, or
   * it would end in mid-air above them.
   */
  fluid?: boolean;
  /** The navigation, if the page has one, placed just after the mark. */
  nav?: ReactNode;
  /**
   * The one control that precedes the mark. Small-screen only by contract — see
   * the note on `brandOffset` — which in practice means the drawer trigger.
   */
  start?: ReactNode;
}) {
  /*
   * Whichever element leads the row sits flush against the gutter. For the mark
   * that means hanging the padding its hover background needs back out of the
   * row, so the wordmark itself starts on the gutter and the linked and unlinked
   * forms sit in exactly the same place — a visitor moving between the pages
   * sees them as one bar that stayed put.
   *
   * `start` is an icon button, whose box is its own outline and needs no such
   * correction, so where there is one the mark gives up the offset and takes it
   * back at `sm`, where the drawer trigger is hidden and the mark leads again.
   */
  const brandOffset = start ? 'sm:-ml-2' : '-ml-2';

  return (
    <header className="sticky top-0 z-40 border-b border-b-border bg-background/85 backdrop-blur">
      <div
        className={`${fluid ? `w-full ${gutter}` : container} flex h-16 items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2">
          {start}
          {brandHref ? (
            /*
             * `focus-visible:status-focused` is the same ring HeroUI's controls
             * draw — the utility their own CSS applies, not an approximation of
             * it. A bare anchor gets none of a `Button`'s styling, so without it
             * this would be the only interactive element on the page with a
             * browser-default outline.
             */
            <Link
              href={brandHref}
              className={`${brand} ${brandOffset} rounded-md px-2 py-1 transition-colors hover:bg-surface-hover focus-visible:status-focused`}
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
          {nav}
        </div>
        {/*
         * `gap-2` rather than the `gap-1` this started at: on a touch screen
         * these are adjacent targets, and 8px is the floor for telling two of
         * them apart with a thumb. It opens up from `sm`, where a pointer does
         * not need the margin.
         */}
        <div className="flex items-center gap-2 sm:gap-3">{children}</div>
      </div>
    </header>
  );
}
