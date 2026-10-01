'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/** What `resets` defaults to — one array, so the default is stable too. */
const NO_RESETS: readonly string[] = [];

/**
 * One choice kept in the query string, read and written in place.
 *
 * The URL is the only state: the value is read from the parameter on every
 * render, and choosing one writes it back. There is no copy in React state to
 * fall out of step with the address bar, which is what lets a refresh, a
 * bookmark or a shared link open on what was left selected.
 *
 * It is written with `window.history.replaceState` rather than the router.
 * Next syncs `useSearchParams` with the native History API without a request,
 * whereas a router navigation would render the page on the server again and
 * rerun a query whose results are already on the page. Replace rather than
 * push, so Back leaves the page instead of stepping through every choice made
 * on it.
 *
 * Shared by the period tabs and the span toggle, which ask the same question of
 * different parameters and sit on the same page: one of them writing the URL
 * from scratch would drop the other's choice. Rebuilding from the current
 * parameters — see `select` — is what keeps both, and having written it once
 * there is no second copy to get that wrong.
 *
 * The routes this is used on are dynamic — the private layout reads the
 * session — so `useSearchParams` has the request's parameters during the server
 * render, and the right choice is selected before hydration rather than after
 * it.
 */
export function useUrlParam<Value extends string>(
  name: string,
  /**
   * The values the parameter may take. The first is the default: what an
   * unknown or missing parameter falls back to, and the one written as no
   * parameter at all — so the bare URL still means what it did.
   */
  values: readonly Value[],
  /**
   * Other parameters to clear whenever this one is chosen: what only meant
   * something under the old choice, as a page number does once the ranking it
   * counted through is no longer the one on show. Cleared in the same write, so
   * the URL never names the new choice beside a leftover of the old.
   *
   * Pass a constant rather than a literal: it is a dependency of `select`, and
   * a fresh array each render would rebuild it each render.
   */
  resets: readonly string[] = NO_RESETS,
): [selected: Value, select: (value: Value) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fallback] = values;
  const requested = searchParams.get(name);
  // Found rather than tested, so what comes back is one of `values` and not
  // merely a string known to be among them: a caller passing a union gets that
  // union back and has nothing to cast before indexing with it.
  const selected = values.find((value) => value === requested) ?? fallback;

  const select = useCallback(
    (value: Value) => {
      // Built from the current parameters rather than from scratch, so whatever
      // else the URL carries — the other control's choice included — survives.
      const params = new URLSearchParams(searchParams.toString());

      if (value === fallback) {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      for (const reset of resets) {
        params.delete(reset);
      }

      const query = params.toString();

      window.history.replaceState(
        null,
        '',
        query ? `${pathname}?${query}` : pathname,
      );
    },
    [fallback, name, pathname, resets, searchParams],
  );

  return [selected, select];
}
