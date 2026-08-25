import type { PeriodLeader } from '@/features/ph-stocks/data/dto';
import {
  formatPercent,
  formatPrice,
  toneClassName,
} from '@/features/ph-stocks/ui/format';
import { Table } from '@heroui/react';

/**
 * One period's ranking.
 *
 * A Server Component, like the rest of this feature's UI: `Table` and its parts
 * carry their own `'use client'`, so the rows cross the boundary already
 * formatted and no figure is rendered twice in two locales. That does rule out
 * the collection props that take a callback — `items` and `renderEmptyState` —
 * because a function cannot be serialised, so the rows are mapped here and the
 * empty case is answered before the table is reached at all.
 *
 * The rank is the row's position rather than a figure carried on it: the list
 * arrives ranked, and numbering it here is the one place the two cannot
 * disagree.
 */
export default function LeadersTable({
  label,
  leaders,
}: {
  /** Names the table for a screen reader, which the tab above it does not. */
  label: string;
  leaders: PeriodLeader[];
}) {
  if (leaders.length === 0) {
    return (
      <p className="text-muted p-2 text-sm">
        No stock has enough history to be ranked over this period.
      </p>
    );
  }

  return (
    <Table variant="secondary">
      {/* The one horizontal scroller: on a phone the columns are wider than the
       * viewport, and without this the page itself would scroll. */}
      <Table.ScrollContainer>
        <Table.Content aria-label={label}>
          <Table.Header>
            {/* `w-0` so the column takes only what its two digits need and the
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
            {leaders.map((leader, index) => (
              // `id` is what the collection keys the row by; React's own `key`
              // does not reach it.
              <Table.Row id={leader.symbol} key={leader.symbol}>
                {/* `tabular-nums` so the digits line up column-wise instead of
                 * shifting with the width of each glyph. */}
                <Table.Cell className="text-muted text-end tabular-nums">
                  {index + 1}
                </Table.Cell>
                <Table.Cell className="font-medium">{leader.symbol}</Table.Cell>
                <Table.Cell className="text-end tabular-nums">
                  {formatPrice(leader.close)}
                </Table.Cell>
                {/* Coloured by sign rather than by rank: in a period the whole
                 * board spent falling, the leaders are the smallest losses, and
                 * a red figure is the honest way to say so. */}
                <Table.Cell
                  className={`text-end font-medium tabular-nums ${toneClassName(leader.changePercent)}`}
                >
                  {formatPercent(leader.changePercent)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
