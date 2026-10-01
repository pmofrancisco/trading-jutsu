/** One slot in a pager: a page that can be picked, or a run of pages left out. */
export type PaginationWindowItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis' };

/**
 * The page numbers a pager shows for a given page and count: the first, the
 * last, the current one and its neighbours either side, with an ellipsis for
 * each run left out between them.
 *
 * HeroUI's `Pagination` is markup only — it draws whatever items it is handed
 * and has no notion of a page count — so which numbers appear is decided here.
 * Kept apart from the table that uses it because it is arithmetic and nothing
 * else: no hook, no DOM, nothing a client boundary is needed for.
 *
 * A gap of exactly one page is filled in rather than elided. An ellipsis
 * standing in for a single number takes the same room as the number and says
 * less, and filling it keeps the strip from changing length as the selection
 * crosses the second page or the second to last.
 */
export function paginationWindow(
  page: number,
  pageCount: number,
): PaginationWindowItem[] {
  // A set, because near either end these overlap — on page 1 the current page
  // is the first page — and each number belongs on the strip once.
  const shown = new Set([1, page - 1, page, page + 1, pageCount]);

  const pages = [...shown]
    .filter((candidate) => candidate >= 1 && candidate <= pageCount)
    .sort((a, b) => a - b);

  const items: PaginationWindowItem[] = [];
  let previous = 0;

  for (const candidate of pages) {
    if (candidate - previous === 2) {
      items.push({ type: 'page', page: previous + 1 });
    } else if (candidate - previous > 2) {
      items.push({ type: 'ellipsis' });
    }

    items.push({ type: 'page', page: candidate });
    previous = candidate;
  }

  return items;
}
