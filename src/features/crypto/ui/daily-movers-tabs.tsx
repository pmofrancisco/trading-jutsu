import SharedDailyMoversTabs from '@/components/daily-movers-tabs';
import type { DailyMovers } from '@/features/crypto/data/dto';
import * as format from '@/features/crypto/ui/format';

/**
 * The crypto day's gainers and losers.
 *
 * The markup lives in `components/daily-movers-tabs`, shared with both stock
 * markets: the tables are the same four columns and the same two tabs. What is
 * this feature's own is how the figures are written and what an empty list is
 * called, so binding this market's formatters and messages — and its
 * `DailyMover` type — is all this wrapper does. A page composes routes; it
 * should not have to know which formatters a market writes its prices with.
 *
 * The messages say "coin" rather than the shared default's "stock", and name no
 * session: crypto never closes, so what these tables rank is a UTC day.
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
      gainersEmptyMessage="No coin closed higher on this day."
      losers={losers}
      losersEmptyMessage="No coin closed lower on this day."
    />
  );
}
