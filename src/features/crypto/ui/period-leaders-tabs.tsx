import SharedPeriodLeadersTabs from '@/components/period-leaders-tabs';
import type { PeriodLeaders } from '@/features/crypto/data/dto';
import * as format from '@/features/crypto/ui/format';

/**
 * The crypto board ranked over each window.
 *
 * The markup lives in `components/period-leaders-tabs`, shared with both stock
 * markets: the tables are the same four columns and the same four tabs. What is
 * this feature's own is how the figures are written and what an empty ranking
 * is called, so binding this market's formatters and message — and its
 * `PeriodLeader` type — is all this wrapper does. A page composes routes; it
 * should not have to know which formatters a market writes its prices with.
 *
 * The message says "coin" rather than the shared default's "stock".
 */
export default function PeriodLeadersTabs({
  fallbackLogoUrl,
  periods,
}: Pick<PeriodLeaders, 'fallbackLogoUrl' | 'periods'>) {
  return (
    <SharedPeriodLeadersTabs
      emptyMessage="No coin gained over this period."
      fallbackLogoUrl={fallbackLogoUrl}
      format={format}
      periods={periods}
    />
  );
}
