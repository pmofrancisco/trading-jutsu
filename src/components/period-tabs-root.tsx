'use client';

import { PAGE_PARAM } from '@/components/page-param';
import { useUrlParam } from '@/components/url-param';
import { Tabs } from '@heroui/react';
import type { Key, ReactNode } from 'react';
import { useState } from 'react';

/** The query parameter the selected window is kept in. */
const PERIOD_PARAM = 'period';

/**
 * What picking a window clears: the page of the ranking that was on show, which
 * counts through a different ranking — of a different length — under any other
 * tab. Harmless where the panels hold nothing paged, there being no such
 * parameter to clear.
 */
const PERIOD_RESETS = [PAGE_PARAM];

/**
 * `Tabs` with its selection kept in the URL, so a refresh, a bookmark or a
 * shared link opens on the window it was left on.
 *
 * `useUrlParam` holds that selection — see it for why the URL is the only state
 * and why it is written with `replaceState` rather than the router. All this
 * adds is the indicator's transition, which is a `Tabs` problem and not a URL
 * one.
 *
 * `periods` arrives as a prop rather than imported from `period-tabs`, which
 * renders this: the two would import each other. Its first entry is the
 * default, the tab an unknown or missing parameter falls back to, and the one
 * written as no parameter at all — so the bare URL still means what it did.
 */
export default function PeriodTabsRoot({
  children,
  periods,
}: {
  children: ReactNode;
  periods: string[];
}) {
  const [selected, selectPeriod] = useUrlParam(
    PERIOD_PARAM,
    periods,
    PERIOD_RESETS,
  );

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
    selectPeriod(String(key));
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
