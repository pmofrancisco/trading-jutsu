import SharedPeriodLeadersTabs from '@/components/period-leaders-tabs';
import type { PeriodLeaders } from '@/features/us-stocks/data/dto';
import * as format from '@/features/us-stocks/ui/format';

/**
 * The US board ranked over each window.
 *
 * The markup lives in `components/period-leaders-tabs`, shared with PH Stocks:
 * the two tables are the same four columns and the same four tabs. What is this
 * feature's own is the locale the figures are written in, so binding this
 * market's formatters — and its `PeriodLeader` type — is all this wrapper does.
 * A page composes routes; it should not have to know which formatters a market
 * writes its prices with.
 */
export default function PeriodLeadersTabs({
  periods,
}: Pick<PeriodLeaders, 'periods'>) {
  return <SharedPeriodLeadersTabs format={format} periods={periods} />;
}
