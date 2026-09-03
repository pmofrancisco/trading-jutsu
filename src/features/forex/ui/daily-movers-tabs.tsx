import SharedDailyMoversTabs from '@/components/daily-movers-tabs';
import type { DailyMovers } from '@/features/forex/data/dto';
import * as format from '@/features/forex/ui/format';

/**
 * The forex day's gainers and losers.
 *
 * The markup lives in `components/daily-movers-tabs`, shared with every other
 * market: the tables are the same four columns and the same two tabs. What is
 * this feature's own is how the figures are written and what an empty list is
 * called, so binding this market's formatters and messages — and its
 * `DailyMover` type — is all this wrapper does. A page composes routes; it
 * should not have to know which formatters a market writes its rates with.
 *
 * The messages say "pair" rather than the shared default's "stock", and name no
 * session: the spot market has no closing bell, so what these tables rank is a
 * UTC day.
 */
export default function DailyMoversTabs({
  fallbackLogoUrl,
  gainers,
  losers,
}: Pick<DailyMovers, 'fallbackLogoUrl' | 'gainers' | 'losers'>) {
  return (
    <SharedDailyMoversTabs
      fallbackLogoUrl={fallbackLogoUrl}
      format={format}
      gainers={gainers}
      gainersEmptyMessage="No pair closed higher on this day."
      losers={losers}
      losersEmptyMessage="No pair closed lower on this day."
    />
  );
}
