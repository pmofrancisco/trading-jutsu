import SharedPeriodLeadersTabs from '@/components/period-leaders-tabs';
import type { RankedPeriodLeaders } from '@/features/crypto/data/dto';
import * as format from '@/features/crypto/ui/format';

/**
 * The crypto board ranked over each window.
 *
 * The markup lives in `components/period-leaders-tabs`, shared with every other
 * market: the tables are the same four columns, the same four tabs and the same
 * two turns. What is this feature's own is how the figures and dates are
 * written and what an empty ranking is called, so binding this market's
 * formatters and message — and its `PeriodWindow` type — is all this wrapper
 * does. A page composes routes; it should not have to know which formatters a
 * market writes its prices with.
 *
 * The message says "coin" rather than the shared default's "stock".
 */
export default function PeriodLeadersTabs({
  asOf,
  fallbackLogoUrl,
  periods,
}: Pick<RankedPeriodLeaders, 'asOf' | 'fallbackLogoUrl' | 'periods'>) {
  return (
    <SharedPeriodLeadersTabs
      asOf={asOf}
      emptyMessage="No coin gained over this period."
      fallbackLogoUrl={fallbackLogoUrl}
      format={format}
      periods={periods}
    />
  );
}
