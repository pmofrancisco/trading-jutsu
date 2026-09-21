import SharedPeriodLeadersTabs from '@/components/period-leaders-tabs';
import type { RankedPeriodLeaders } from '@/features/ph-stocks/data/dto';
import * as format from '@/features/ph-stocks/ui/format';

/**
 * The PH board ranked over each window.
 *
 * The markup lives in `components/period-leaders-tabs`, shared with every other
 * market: the tables are the same four columns, the same four tabs and the same
 * two turns. What is this feature's own is the locale the figures and dates are
 * written in, so binding this market's formatters — and its `PeriodWindow`
 * type — is all this wrapper does. A page composes routes; it should not have
 * to know which formatters a market writes its prices with.
 */
export default function PeriodLeadersTabs({
  asOf,
  fallbackLogoUrl,
  periods,
}: Pick<RankedPeriodLeaders, 'asOf' | 'fallbackLogoUrl' | 'periods'>) {
  return (
    <SharedPeriodLeadersTabs
      asOf={asOf}
      fallbackLogoUrl={fallbackLogoUrl}
      format={format}
      periods={periods}
    />
  );
}
