import { Skeleton, Table } from '@heroui/react';

/**
 * One stock's move over a session, as a table renders it.
 *
 * Declared here rather than imported from a feature, because a shared component
 * may not reach into one — see the layering rules in `AGENTS.md`. Both markets'
 * `DailyMover` DTOs satisfy this structurally, so each feature still hands over
 * its own type and nothing is cast.
 */
export interface Mover {
  symbol: string;
  close: number;
  change: number;
  changePercent: number;
}

/**
 * How a market writes its figures — its `ui/format` module, passed in whole.
 *
 * The markup below is the same for every market; the locale is not. Rather than
 * duplicate a table per market so each can import its own formatters, the
 * formatters come in as a prop and the caller binds them. Functions are fine
 * here: this component and its callers are all Server Components, so the props
 * are never serialised.
 */
export interface MoverFormat {
  formatPercent: (percent: number) => string;
  formatPrice: (price: number) => string;
  formatPriceChange: (change: number) => string;
  toneClassName: (change: number) => string;
}

/**
 * The four columns both states of the table are ranked into.
 *
 * Written once rather than per state, because a skeleton whose columns had
 * drifted from the real table's would resize every heading the moment the rows
 * arrived — the shift a skeleton exists to prevent.
 */
function MoversColumns() {
  return (
    <Table.Header>
      {/* `isRowHeader` makes the symbol the row's name, so a screen
       * reader announces "AAPL, Close, 231.40" rather than a bare
       * figure. */}
      <Table.Column id="symbol" isRowHeader>
        Symbol
      </Table.Column>
      <Table.Column className="text-end" id="close">
        Close
      </Table.Column>
      <Table.Column className="text-end" id="change">
        Change
      </Table.Column>
      <Table.Column className="text-end" id="changePercent">
        % Change
      </Table.Column>
    </Table.Header>
  );
}

/**
 * One ranked list of movers.
 *
 * A Server Component, like the feature UI that wraps it: `Table` and its parts
 * carry their own `'use client'`, so the rows cross the boundary already
 * formatted and no figure is rendered twice in two locales. That does rule out
 * the collection props that take a callback — `items` and `renderEmptyState` —
 * because a function cannot be serialised, so the rows are mapped here and the
 * empty case is answered before the table is reached at all.
 */
export default function MoversTable({
  emptyMessage,
  format,
  label,
  movers,
}: {
  emptyMessage: string;
  format: MoverFormat;
  /** Names the table for a screen reader, which the tab above it does not. */
  label: string;
  movers: Mover[];
}) {
  if (movers.length === 0) {
    return <p className="text-muted p-2 text-sm">{emptyMessage}</p>;
  }

  return (
    <Table variant="secondary">
      {/* The one horizontal scroller: on a phone the columns are wider than the
       * viewport, and without this the page itself would scroll. */}
      <Table.ScrollContainer>
        <Table.Content aria-label={label}>
          <MoversColumns />
          <Table.Body>
            {movers.map((mover) => (
              // `id` is what the collection keys the row by; React's own `key`
              // does not reach it.
              <Table.Row id={mover.symbol} key={mover.symbol}>
                <Table.Cell className="font-medium">{mover.symbol}</Table.Cell>
                {/* `tabular-nums` so the digits line up column-wise instead of
                 * shifting with the width of each glyph. */}
                <Table.Cell className="text-end tabular-nums">
                  {format.formatPrice(mover.close)}
                </Table.Cell>
                <Table.Cell
                  className={`text-end tabular-nums ${format.toneClassName(mover.change)}`}
                >
                  {format.formatPriceChange(mover.change)}
                </Table.Cell>
                <Table.Cell
                  className={`text-end font-medium tabular-nums ${format.toneClassName(mover.change)}`}
                >
                  {format.formatPercent(mover.changePercent)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

/**
 * How many placeholder rows a loading table stands in with.
 *
 * Not `MOVER_LIMIT`: the real list is fifty deep, and fifty shimmering bars
 * would be a wall of animation to say one thing. Eight is about a phone's worth
 * — enough to read as a ranked list rather than a stray bar, and the real table
 * runs past the fold either way, so the swap reads as the list filling in.
 */
const SKELETON_ROW_COUNT = 8;

/**
 * The placeholder rows, keyed by position — the only key there is before the
 * symbols arrive.
 */
const SKELETON_ROWS = Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => i);

/**
 * The same table with its figures still in flight.
 *
 * The real `Table` rather than a grid of bars, sharing `MoversColumns` with the
 * list above: the headings, the column widths, the row height and the scroller
 * are all the loaded table's, so nothing about the frame moves when the rows
 * land — only the bars are replaced by figures.
 *
 * The bars are a fixed width per column rather than a varied one per row. Their
 * widths say roughly how wide a symbol and a price are; varying them row by row
 * would suggest this list already knows which symbols it is waiting for, which
 * it does not.
 */
export function MoversTableSkeleton({ label }: { label: string }) {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label={label}>
          <MoversColumns />
          <Table.Body>
            {SKELETON_ROWS.map((row) => (
              <Table.Row id={row} key={row}>
                <Table.Cell>
                  <Bar className="w-16" />
                </Table.Cell>
                <Table.Cell>
                  {/* `ms-auto` rather than the column's `text-end`: the bar is a
                   * block, and text alignment does not move one. */}
                  <Bar className="ms-auto w-14" />
                </Table.Cell>
                <Table.Cell>
                  <Bar className="ms-auto w-12" />
                </Table.Cell>
                <Table.Cell>
                  <Bar className="ms-auto w-14" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

/**
 * One cell's worth of placeholder.
 *
 * `h-4` with `my-0.5` rather than a bare `h-5`: a cell's line box is the 20px
 * of `text-sm`, so the bar and its margins have to add up to that or every row
 * would change height when the figures arrive. Sixteen pixels of bar reads as a
 * figure; twenty reads as a slab.
 */
function Bar({ className }: { className: string }) {
  return <Skeleton className={`my-0.5 h-4 ${className}`} />;
}
