'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * The query parameter the page of a ranking is kept in.
 *
 * Exported because the controls that change *which* ranking is on show have to
 * clear it — see `resets` on `useUrlParam`.
 */
export const PAGE_PARAM = 'page';

/** The nearest page there actually is to the one asked for. */
function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 1), Math.max(pageCount, 1));
}

/**
 * A page number kept in the query string, read and written in place.
 *
 * `useUrlParam`'s sibling rather than a caller of it. That hook answers which
 * of a fixed list of names is selected, found by equality; this is a number
 * held within a range only the caller knows, and bending one hook to both
 * would leave it with two ways of reading a parameter. What the two share is
 * the bargain: the URL is the only state, and it is written with
 * `replaceState` so that turning a page costs no request — see `useUrlParam`
 * for why.
 *
 * Page 1 is written as no parameter at all, the way every default on these
 * pages is, so the bare URL still means what it did.
 *
 * A page that is not there — a hand-edited `?page=999`, or a bookmark to the
 * end of a ranking that has since shortened — is clamped to the nearest one
 * that is rather than sent back to the start: the last page is closer to what
 * was asked for than the first. Anything that is not a whole number is not a
 * page at all, and reads as the first.
 */
export function usePageParam(
  pageCount: number,
): [page: number, selectPage: (page: number) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = Number(searchParams.get(PAGE_PARAM));
  const page = Number.isInteger(requested)
    ? clampPage(requested, pageCount)
    : 1;

  const selectPage = useCallback(
    (value: number) => {
      // Built from the current parameters rather than from scratch, so the
      // period and the turn this ranking was reached by survive the write.
      const params = new URLSearchParams(searchParams.toString());
      const next = clampPage(value, pageCount);

      if (next === 1) {
        params.delete(PAGE_PARAM);
      } else {
        params.set(PAGE_PARAM, String(next));
      }

      const query = params.toString();

      window.history.replaceState(
        null,
        '',
        query ? `${pathname}?${query}` : pathname,
      );
    },
    [pageCount, pathname, searchParams],
  );

  return [page, selectPage];
}
