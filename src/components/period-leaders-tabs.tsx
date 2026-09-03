import type { Leader, LeaderFormat } from '@/components/leaders-table';
import LeadersTable from '@/components/leaders-table';
import type { Period } from '@/components/period-tabs';
import PeriodTabs, { PERIOD_LABELS } from '@/components/period-tabs';

/**
 * The four rankings, one at a time.
 *
 * Tabs rather than four tables down the page, for the reason the gainers and
 * losers are tabbed: they are the same columns ranked over a different window,
 * and stacked they would be four screens of near-identical tables with no way
 * to compare the top of one against the top of another.
 *
 * Shared rather than one copy per market: what differs between the pages is the
 * locale the figures are written in, which arrives as `format` — see
 * `LeaderFormat` — and what an empty ranking is called, which arrives as the
 * message below.
 */
export default function PeriodLeadersTabs({
  emptyMessage = 'No stock gained over this period.',
  fallbackLogoUrl,
  format,
  periods,
}: {
  /**
   * What an empty ranking is called.
   *
   * Optional, defaulting to the stock markets' wording, because that is what
   * two of the three callers want and a market that shares the phrasing should
   * not have to restate it. Crypto passes its own: it has no stocks.
   *
   * It says nothing gained rather than nothing has the history to be ranked,
   * because both are now reasons a ranking is empty and the falling board is
   * the one a reader will actually meet. It stays true of the other: nothing
   * that cannot be measured is known to have gained either.
   */
  emptyMessage?: string;
  /** The market's stand-in mark, passed straight through to each ranking. */
  fallbackLogoUrl: string;
  format: LeaderFormat;
  periods: Record<Period, Leader[]>;
}) {
  return (
    <PeriodTabs label="Leaders period">
      {(period) => (
        // The label the table carries is the window it ranks, so a screen
        // reader landing in the table knows which of the four it is in. It is
        // drawn from the same record the tab above it is, so the two can only
        // ever say the same word.
        <LeadersTable
          emptyMessage={emptyMessage}
          fallbackLogoUrl={fallbackLogoUrl}
          format={format}
          label={`${PERIOD_LABELS[period]} leaders`}
          leaders={periods[period]}
        />
      )}
    </PeriodTabs>
  );
}
