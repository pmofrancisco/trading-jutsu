import type { PeriodLeaders } from '@/features/ph-stocks/data/dto';
import LeadersTable from '@/features/ph-stocks/ui/leaders-table';
import PeriodTabs, { PERIOD_LABELS } from '@/features/ph-stocks/ui/period-tabs';

/**
 * The four rankings, one at a time.
 *
 * Tabs rather than four tables down the page, for the reason the gainers and
 * losers are tabbed: they are the same columns ranked over a different window,
 * and stacked they would be four screens of near-identical tables with no way
 * to compare the top of one against the top of another.
 */
export default function PeriodLeadersTabs({
  periods,
}: Pick<PeriodLeaders, 'periods'>) {
  return (
    <PeriodTabs label="Leaders period">
      {(period) => (
        // The label the table carries is the window it ranks, so a screen
        // reader landing in the table knows which of the four it is in. It is
        // drawn from the same record the tab above it is, so the two can only
        // ever say the same word.
        <LeadersTable
          label={`${PERIOD_LABELS[period]} leaders`}
          leaders={periods[period]}
        />
      )}
    </PeriodTabs>
  );
}
