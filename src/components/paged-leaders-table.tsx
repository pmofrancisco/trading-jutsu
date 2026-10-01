'use client';

import { usePageParam } from '@/components/page-param';
import { paginationWindow } from '@/components/pagination-window';
import SymbolLogo from '@/components/symbol-logo';
import { Pagination, Table } from '@heroui/react';
import { useRef } from 'react';

/**
 * One row of a ranking, already written out in its market's locale.
 *
 * The figures are strings because this is what crosses from the server: the
 * formatters that wrote them are functions and cannot — see `LeadersTable`.
 * Nothing is carried that a row does not show, since every row of every
 * ranking is sent whether or not its page is ever opened.
 */
export interface FormattedLeader {
  symbol: string;
  logoUrl: string;
  close: string;
  changePercent: string;
  /** The tone the change is coloured in, resolved from its sign. */
  toneClassName: string;
}

/**
 * One period's ranking, a page at a time.
 *
 * A Client Component, where the table around it is not, because turning a page
 * is something the browser does: the whole ranking arrives with the page and
 * this slices it, so a page costs no request — the bargain the period tabs and
 * the span toggle already strike. They pick between panels the server
 * rendered; this cannot, because a ranking's pages are as many as the board
 * has gainers and rendering each would send a table of markup per page for
 * rows nobody opens. It is sent the rows instead, once, and draws the fifty in
 * view.
 *
 * The page is kept in the URL — see `usePageParam` — and belongs to whichever
 * ranking is on show: the tabs and the toggle clear it when they change that.
 *
 * The rank is still the row's position, counted through the pages before it:
 * the list arrives ranked, and numbering it here is the one place the two
 * cannot disagree.
 */
export default function PagedLeadersTable({
  fallbackLogoUrl,
  label,
  pageSize,
  rows,
}: {
  /** The market's stand-in mark, for the rows whose own logo will not load. */
  fallbackLogoUrl: string;
  /** Names the table for a screen reader, and the pager under it. */
  label: string;
  pageSize: number;
  /** The whole ranking, biggest gain first. */
  rows: FormattedLeader[];
}) {
  const pageCount = Math.ceil(rows.length / pageSize);
  const [page, selectPage] = usePageParam(pageCount);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, rows.length);

  const top = useRef<HTMLDivElement>(null);

  function turnTo(next: number) {
    const table = top.current;

    // Arriving at either end disables the arrow that led there, and a disabled
    // button cannot keep focus: the browser drops it to the document, and
    // someone paging by keyboard is sent back to the top of the page to find
    // the pager again. The end's own number is always on the strip — see
    // `paginationWindow` — so focus is handed to it before the arrow goes.
    if (next === 1 || next === pageCount) {
      table
        ?.querySelector<HTMLElement>(`[aria-label="Page ${next}"]`)
        ?.focus({ preventScroll: true });
    }

    selectPage(next);

    // The pager sits under fifty rows, so by the time it is pressed the head
    // of the table has usually scrolled away and the new page would open at
    // its foot. Only when it has: a short last page that fits the screen
    // should not move at all.

    if (table && table.getBoundingClientRect().top < 0) {
      table.scrollIntoView({ block: 'start' });
    }
  }

  return (
    // `scroll-mt-20` because the app's header is sticky: scrolled flush to the
    // top of the viewport, the column headings would sit underneath it.
    <div className="flex scroll-mt-20 flex-col gap-2" ref={top}>
      <Table variant="secondary">
        {/* The one horizontal scroller: on a phone the columns are wider than the
         * viewport, and without this the page itself would scroll. */}
        <Table.ScrollContainer>
          <Table.Content aria-label={label}>
            <Table.Header>
              {/* `w-0` so the column takes only what its digits need and the
               * rest of the width goes to the figures. */}
              <Table.Column className="w-0 text-end" id="rank">
                Rank
              </Table.Column>
              {/* `isRowHeader` makes the symbol the row's name, so a screen
               * reader announces "AC, Close, 30.70" rather than a bare figure. */}
              <Table.Column id="symbol" isRowHeader>
                Symbol
              </Table.Column>
              <Table.Column className="text-end" id="close">
                Close
              </Table.Column>
              <Table.Column className="text-end" id="changePercent">
                % Change
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.slice(start, end).map((leader, index) => (
                // `id` is what the collection keys the row by; React's own `key`
                // does not reach it.
                <Table.Row id={leader.symbol} key={leader.symbol}>
                  {/* `tabular-nums` so the digits line up column-wise instead of
                   * shifting with the width of each glyph. */}
                  <Table.Cell className="text-muted text-end tabular-nums">
                    {start + index + 1}
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    {/* The mark and the symbol are one line: `items-center`
                     * centres the two against each other rather than seating the
                     * image on the text's baseline, which a taller box would
                     * otherwise do. */}
                    <div className="flex items-center gap-2">
                      <SymbolLogo
                        fallbackUrl={fallbackLogoUrl}
                        src={leader.logoUrl}
                      />
                      {leader.symbol}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-end tabular-nums">
                    {leader.close}
                  </Table.Cell>
                  <Table.Cell
                    className={`text-end font-medium tabular-nums ${leader.toneClassName}`}
                  >
                    {leader.changePercent}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      {/* A ranking that fits one page has nothing to turn to, and a pager
       * offering only the page already on show is a control that does
       * nothing. */}
      {pageCount > 1 && (
        <Pagination aria-label={`${label} pages`} size="sm">
          {/* Announced politely, so a screen reader hears which rows the press
           * brought up without focus leaving the button that was pressed. */}
          <Pagination.Summary aria-live="polite">
            {start + 1}–{end} of {rows.length}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              {/* Named, as `Next` is below: the arrow is all either shows. */}
              <Pagination.Previous
                aria-label="Previous page"
                isDisabled={page === 1}
                onPress={() => turnTo(page - 1)}
              >
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            {paginationWindow(page, pageCount).map((item, index) =>
              item.type === 'ellipsis' ? (
                // Keyed by where it sits, there being at most two and nothing
                // else to tell them apart.
                <Pagination.Item key={`ellipsis-${index}`}>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              ) : (
                <Pagination.Item key={item.page}>
                  <Pagination.Link
                    aria-label={`Page ${item.page}`}
                    isActive={item.page === page}
                    onPress={() => turnTo(item.page)}
                  >
                    {item.page}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                aria-label="Next page"
                isDisabled={page === pageCount}
                onPress={() => turnTo(page + 1)}
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}
