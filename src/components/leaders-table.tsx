import type { FormattedLeader } from '@/components/paged-leaders-table';
import PagedLeadersTable from '@/components/paged-leaders-table';

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
 * How many rows of a ranking are on show at once.
 *
 * Fifty, which is what the page showed when a ranking was cut there, so the
 * first page of each is the table it always was. It lives here and not in a
 * data layer because it is no longer a limit on any query: the rankings arrive
 * whole — or, on the one board too large for that, cut far deeper than this —
 * and how many rows share a screen is the table's own business.
 */
const LEADERS_PAGE_SIZE = 50;

/**
 * One period's ranking.
 *
 * A Server Component that formats and hands over, because the two halves of the
 * job sit either side of the client boundary. Writing a figure takes the
 * market's formatters, which are functions and cannot be serialised; turning a
 * page takes state in the browser. So every figure is written out here, once
 * and in one locale, and `PagedLeadersTable` is handed rows of strings to page
 * through.
 *
 * The empty message arrives as a prop, the way `MoversTable`'s does. There is
 * only ever the one case to describe — a window nothing on the board has the
 * history to be ranked over — but what is on the board differs: two of the three
 * markets list stocks and the third lists coins, and the sentence names them.
 * The default sits on the caller above, so a market that shares the phrasing
 * does not restate it. It is answered here, before the client table is reached
 * at all: an empty ranking has no rows to send and no page to turn.
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

  const rows: FormattedLeader[] = leaders.map((leader) => ({
    symbol: leader.symbol,
    logoUrl: leader.logoUrl,
    close: format.formatPrice(leader.close),
    changePercent: format.formatPercent(leader.changePercent),
    // Coloured by sign rather than by rank. Every figure a ranking holds is a
    // gain — the queries drop the flat and the falling — so in practice this
    // is always the up tone; it is still asked for rather than hardcoded,
    // because the table is handed a `Leader` and cannot see what filtered it.
    toneClassName: format.toneClassName(leader.changePercent),
  }));

  return (
    <PagedLeadersTable
      fallbackLogoUrl={fallbackLogoUrl}
      label={label}
      pageSize={LEADERS_PAGE_SIZE}
      rows={rows}
    />
  );
}
