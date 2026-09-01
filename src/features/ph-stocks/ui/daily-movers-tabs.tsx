import SharedDailyMoversTabs from '@/components/daily-movers-tabs';
import type { DailyMovers } from '@/features/ph-stocks/data/dto';
import * as format from '@/features/ph-stocks/ui/format';

/**
 * The PH session's gainers and losers.
 *
 * The markup lives in `components/daily-movers-tabs`, shared with US Stocks:
 * the two tables are the same four columns and the same two tabs. What is this
 * feature's own is the locale the figures are written in, so binding this
 * market's formatters — and its `DailyMover` type — is all this wrapper does.
 * A page composes routes; it should not have to know which formatters a market
 * writes its prices with.
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
      losers={losers}
    />
  );
}
