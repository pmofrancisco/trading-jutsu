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
 * Shared rather than one copy per market: what differs between the two pages is
 * the locale the figures are written in, and that arrives as `format` — see
 * `LeaderFormat`.
 */
export default function PeriodLeadersTabs({
  format,
  periods,
}: {
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
          format={format}
          label={`${PERIOD_LABELS[period]} leaders`}
          leaders={periods[period]}
        />
      )}
    </PeriodTabs>
  );
}
