'use client';

import { Tabs } from '@heroui/react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Key, ReactNode } from 'react';
import { useState } from 'react';

/** The query parameter the selected window is kept in. */
const PERIOD_PARAM = 'period';

/**
 * `Tabs` with its selection kept in the URL, so a refresh, a bookmark or a
 * shared link opens on the window it was left on.
 *
 * The URL is the only state: the selected tab is read from `?period=` on every
 * render, and choosing one writes it back. There is no copy in React state to
 * fall out of step with the address bar.
 *
 * It is written with `window.history.replaceState` rather than the router.
 * Next syncs `useSearchParams` with the native History API without a request,
 * whereas a router navigation would render the page on the server again and
 * rerun a query whose results — every window's — are already on the page.
 * Replace rather than push, so Back leaves the page instead of stepping through
 * the tabs clicked on it.
 *
 * `periods` arrives as a prop rather than imported from `period-tabs`, which
 * renders this: the two would import each other. Its first entry is the
 * default, the tab an unknown or missing parameter falls back to, and the one
 * written as no parameter at all — so the bare URL still means what it did.
 *
 * The routes this renders on are dynamic — the private layout reads the
 * session — so `useSearchParams` has the request's parameters during the server
 * render, and the right tab is selected before hydration rather than after it.
 */
export default function PeriodTabsRoot({
  children,
  periods,
}: {
  children: ReactNode;
  periods: string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [defaultPeriod] = periods;
  const requested = searchParams.get(PERIOD_PARAM);
  const selected =
    requested !== null && periods.includes(requested)
      ? requested
      : defaultPeriod;

  /*
   * Whether the pill behind the selected tab may slide, which it may not until
   * someone first picks a tab.
   *
   * React Aria slides the pill by measuring where the old one was as it
   * unmounts and starting the new one from there. But its tabs also remount on
   * their own while the page hydrates — it swaps the server-rendered collection
   * for a client-built one — and the tabs beside the selected one are removed
   * first, so the pill is measured at the start of the list. On a page opened
   * on any tab but the first, it would slide in from the first tab, and a
   * remount landing mid-slide leaves it stuck there, over the first tab's label.
   * React Aria only measures a pill that has a transition, so holding the
   * transition off until a choice is made means hydration has nothing to
   * measure.
   *
   * Turned on in `select` rather than on mount: the remounts follow hydration
   * by an unknown number of renders. It is not too late for the choice it
   * follows either — this update is committed before the tab changes, because
   * Next applies the URL behind `replaceState` in a transition.
   */
  const [canSlide, setCanSlide] = useState(false);

  function select(key: Key) {
    setCanSlide(true);
    // Built from the current parameters rather than from scratch, so whatever
    // else the URL carries survives a tab switch.
    const params = new URLSearchParams(searchParams.toString());
    if (key === defaultPeriod) {
      params.delete(PERIOD_PARAM);
    } else {
      params.set(PERIOD_PARAM, String(key));
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `${pathname}?${query}` : pathname,
    );
  }

  return (
    <Tabs
      className={
        canSlide ? undefined : '[&_[data-slot=tabs-indicator]]:transition-none'
      }
      onSelectionChange={select}
      selectedKey={selected}
    >
      {children}
    </Tabs>
  );
}
