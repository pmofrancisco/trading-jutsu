import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { cryptoFallbackLogoUrl, cryptoLogoUrl } from '@/lib/crypto-assets';
import { cryptoDb } from '@/lib/crypto-db';
import type { DailyMover, DailyMovers } from './dto';

/**
 * How many movers each list holds.
 *
 * A movers page is the ends of the board, not the whole of it. This table
 * carries some four hundred coins, so an uncapped page would ship a row for
 * each of them to show the handful anyone came to read. Fifty, the same depth
 * both stock markets cap their lists at.
 */
export const MOVER_LIMIT = 50;

/**
 * The day's biggest movers in each direction.
 *
 * "The day" rather than "the session": crypto never closes, and this table
 * holds one bar per coin per UTC day rather than one per trading session. That
 * changes nothing about the query — the newest timestamp is still the newest
 * bar, so this is the US query's shape unchanged — but it is why the CTE the
 * stock markets call `session` is `newest` here.
 *
 * That day is the newest timestamp in the table rather than today's date, so
 * the page describes the data it actually has: while the upstream loader is
 * behind, that is yesterday's bar and not an empty one. There is no index
 * symbol to exclude the way the PH query must — this database holds coins and
 * nothing else.
 *
 * `previous` deliberately takes each symbol's own last bar before that day
 * rather than the day before it: a coin the loader missed yesterday is still up
 * or down against whenever it last had a bar. Worth knowing when reading the
 * output: that bar is only as recent as the loader has been running, so where
 * the table has a gap, a coin whose last bar precedes it is measured across the
 * whole gap and its move can be far larger than one day's. The alternative —
 * pinning every row to the previous *day* — would report a uniform window but
 * drop every coin that has no bar in it.
 *
 * The ranking happens here rather than in TypeScript so that the two `LIMIT`s
 * decide what crosses the wire: a hundred rows arrive instead of the whole
 * board. Ordering by `change_percent` descending for gainers and ascending for
 * losers puts the biggest move first in each, with the symbol breaking ties so
 * the order is stable between requests.
 *
 * Both `DISTINCT ON` and the latest-day lookup ride the unique
 * `(symbol, timestamp)` index, and `::float8` converts Postgres `numeric` —
 * which node-postgres would otherwise hand back as a string — into a
 * JavaScript number.
 */
const DAILY_MOVERS_SQL = `
  WITH newest AS (
    SELECT max(timestamp) AS ts
    FROM market_data
  ),
  latest AS (
    SELECT m.symbol, m.close
    FROM market_data m, newest s
    WHERE m.timestamp = s.ts
  ),
  previous AS (
    SELECT DISTINCT ON (m.symbol) m.symbol, m.close
    FROM market_data m, newest s
    WHERE m.timestamp < s.ts
    ORDER BY m.symbol, m.timestamp DESC
  ),
  moves AS (
    SELECT
      l.symbol,
      l.close::float8 AS close,
      (l.close - p.close)::float8 AS change,
      ((l.close - p.close) / p.close * 100)::float8 AS change_percent,
      s.ts AS as_of
    FROM latest l
    JOIN previous p ON p.symbol = l.symbol,
    newest s
    -- A zero previous close would divide to Infinity, which renders as a number
    -- and reads as a real move.
    WHERE p.close <> 0
  )
  (
    SELECT * FROM moves
    WHERE change > 0
    ORDER BY change_percent DESC, symbol
    LIMIT $1
  )
  UNION ALL
  (
    SELECT * FROM moves
    WHERE change < 0
    ORDER BY change_percent ASC, symbol
    LIMIT $1
  )
`;

interface MoverRow {
  symbol: string;
  close: number;
  change: number;
  change_percent: number;
  as_of: Date;
}

function toMover(row: MoverRow): DailyMover {
  return {
    symbol: row.symbol,
    logoUrl: cryptoLogoUrl(row.symbol),
    close: row.close,
    change: row.change,
    changePercent: row.change_percent,
  };
}

export async function listDailyMovers(): Promise<DailyMovers> {
  await requireUser();

  const { rows } = await cryptoDb().query<MoverRow>(DAILY_MOVERS_SQL, [
    MOVER_LIMIT,
  ]);

  return {
    // Every row carries the same day; with no rows there is none to name.
    asOf: rows[0]?.as_of ?? null,
    // One value for the whole market, so it is resolved here rather
    // than per row — see `fallbackLogoUrl` on the DTO.
    fallbackLogoUrl: cryptoFallbackLogoUrl(),
    // The query has already ranked each direction, so these only split the two
    // halves of the union back apart — re-sorting here would be redundant.
    gainers: rows.filter((row) => row.change > 0).map(toMover),
    losers: rows.filter((row) => row.change < 0).map(toMover),
  };
}
