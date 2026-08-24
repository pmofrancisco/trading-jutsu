import type { DailyMover } from '@/features/us-stocks/data/dto';
import {
  formatPercent,
  formatPrice,
  formatPriceChange,
  toneClassName,
} from '@/features/us-stocks/ui/format';
import { Table } from '@heroui/react';

/**
 * One ranked list of movers.
 *
 * A Server Component, like the rest of this feature's UI: `Table` and its parts
 * carry their own `'use client'`, so the rows cross the boundary already
 * formatted and no figure is rendered twice in two locales. That does rule out
 * the collection props that take a callback — `items` and `renderEmptyState` —
 * because a function cannot be serialised, so the rows are mapped here and the
 * empty case is answered before the table is reached at all.
 */
export default function MoversTable({
  emptyMessage,
  label,
  movers,
}: {
  emptyMessage: string;
  /** Names the table for a screen reader, which the tab above it does not. */
  label: string;
  movers: DailyMover[];
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
          <Table.Body>
            {movers.map((mover) => (
              // `id` is what the collection keys the row by; React's own `key`
              // does not reach it.
              <Table.Row id={mover.symbol} key={mover.symbol}>
                <Table.Cell className="font-medium">{mover.symbol}</Table.Cell>
                {/* `tabular-nums` so the digits line up column-wise instead of
                 * shifting with the width of each glyph. */}
                <Table.Cell className="text-end tabular-nums">
                  {formatPrice(mover.close)}
                </Table.Cell>
                <Table.Cell
                  className={`text-end tabular-nums ${toneClassName(mover.change)}`}
                >
                  {formatPriceChange(mover.change)}
                </Table.Cell>
                <Table.Cell
                  className={`text-end font-medium tabular-nums ${toneClassName(mover.change)}`}
                >
                  {formatPercent(mover.changePercent)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
