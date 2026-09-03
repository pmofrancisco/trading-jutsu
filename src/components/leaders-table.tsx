import SymbolLogo from '@/components/symbol-logo';
import { Table } from '@heroui/react';

/**
 * One symbol's standing in a period's ranking, as a table renders it.
 *
 * Declared here rather than imported from a feature, because a shared component
 * may not reach into one — see the layering rules in `AGENTS.md`. Every market's
 * `PeriodLeader` DTO satisfies this structurally, so each feature still hands
 * over its own type and nothing is cast.
 */
export interface Leader {
  symbol: string;
  /** The stock's own mark; see `fallbackLogoUrl` on the table for the rest. */
  logoUrl: string;
  close: number;
  changePercent: number;
}

/**
 * How a market writes its figures — the subset of its `ui/format` module this
 * table uses, which a whole module satisfies.
 *
 * The markup below is the same for every market; the locale is not. Rather than
 * duplicate a table per market so each can import its own formatters, the
 * formatters come in as a prop and the caller binds them. Functions are fine
 * here: this component and its callers are all Server Components, so the props
 * are never serialised.
 */
export interface LeaderFormat {
  formatPercent: (percent: number) => string;
  formatPrice: (price: number) => string;
  toneClassName: (change: number) => string;
}

/**
 * One period's ranking.
 *
 * A Server Component, like the feature UI that wraps it: `Table` and its parts
 * carry their own `'use client'`, so the rows cross the boundary already
 * formatted and no figure is rendered twice in two locales. That does rule out
 * the collection props that take a callback — `items` and `renderEmptyState` —
 * because a function cannot be serialised, so the rows are mapped here and the
 * empty case is answered before the table is reached at all.
 *
 * The empty message arrives as a prop, the way `MoversTable`'s does. There is
 * only ever the one case to describe — a window nothing on the board has the
 * history to be ranked over — but what is on the board differs: two of the three
 * markets list stocks and the third lists coins, and the sentence names them.
 * The default sits on the caller above, so a market that shares the phrasing
 * does not restate it.
 *
 * The rank is the row's position rather than a figure carried on it: the list
 * arrives ranked, and numbering it here is the one place the two cannot
 * disagree.
 */
export default function LeadersTable({
  emptyMessage,
  fallbackLogoUrl,
  format,
  label,
  leaders,
}: {
  emptyMessage: string;
  /**
   * The market's stand-in mark, for the rows whose own logo will not load. One
   * prop rather than a field on every `Leader`, because it is one value per
   * market — see `fallbackLogoUrl` on both markets' `PeriodLeaders`.
   */
  fallbackLogoUrl: string;
  format: LeaderFormat;
  /** Names the table for a screen reader, which the tab above it does not. */
  label: string;
  leaders: Leader[];
}) {
  if (leaders.length === 0) {
    return <p className="text-muted p-2 text-sm">{emptyMessage}</p>;
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
                  {format.formatPrice(leader.close)}
                </Table.Cell>
                {/* Coloured by sign rather than by rank. Every figure a
                 * ranking holds is a gain — the queries drop the flat and the
                 * falling — so in practice this is always the up tone; it is
                 * still asked for rather than hardcoded, because the table is
                 * handed a `Leader` and cannot see what filtered it. */}
                <Table.Cell
                  className={`text-end font-medium tabular-nums ${format.toneClassName(leader.changePercent)}`}
                >
                  {format.formatPercent(leader.changePercent)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
