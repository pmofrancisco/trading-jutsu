import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { usStocksDb } from '@/lib/us-stocks-db';
import type { DailyMover, DailyMovers } from './dto';

/**
 * How many movers each list holds.
 *
 * A movers page is the ends of the board, not the whole of it, and that goes
 * double here: this table carries better than twelve thousand symbols in a
 * single session, so an uncapped page would ship a row for each of them to show
 * the handful anyone came to read. The PH page caps at the same fifty.
 */
export const MOVER_LIMIT = 50;

/**
 * The session's biggest movers in each direction.
 *
 * The session is the newest timestamp in the table rather than today's date, so
 * the page describes the data it actually has — over a weekend, or while the
 * upstream loader is behind, that is Friday's session and not an empty one.
 * There is no index symbol to exclude the way the PH query must: this database
 * holds stocks, ETFs, warrants and units, but no index bars that would
 * otherwise turn up among the day's movers.
 *
 * `previous` deliberately takes each symbol's own last bar before that session
 * rather than the session before it: a stock that did not trade yesterday is
 * still up or down against whenever it last did, which is the change an exchange
 * itself quotes. Worth knowing when reading the output: that bar is only as
 * recent as the loader has been running, so where the table has a gap, a symbol
 * that last traded before it is measured across the whole gap and its move can
 * be far larger than one session's. The alternative — pinning every row to the
 * previous *session* — would report a uniform window but drop every symbol that
 * did not trade in it.
 *
 * The ranking happens here rather than in TypeScript so that the two `LIMIT`s
 * decide what crosses the wire: a hundred rows arrive instead of twelve
 * thousand. Ordering by `change_percent` descending for gainers and ascending
 * for losers puts the biggest move first in each, with the symbol breaking ties
 * so the order is stable between requests.
 *
 * Both `DISTINCT ON` and the latest-session lookup ride the unique
 * `(symbol, timestamp)` index, and `::float8` converts Postgres `numeric` —
 * which node-postgres would otherwise hand back as a string — into a
 * JavaScript number.
 */
const DAILY_MOVERS_SQL = `
  WITH session AS (
    SELECT max(timestamp) AS ts
    FROM market_data
  ),
  latest AS (
    SELECT m.symbol, m.close
    FROM market_data m, session s
    WHERE m.timestamp = s.ts
  ),
  previous AS (
    SELECT DISTINCT ON (m.symbol) m.symbol, m.close
    FROM market_data m, session s
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
    session s
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
    close: row.close,
    change: row.change,
    changePercent: row.change_percent,
  };
}

export async function listDailyMovers(): Promise<DailyMovers> {
  await requireUser();

  const { rows } = await usStocksDb().query<MoverRow>(DAILY_MOVERS_SQL, [
    MOVER_LIMIT,
  ]);

  return {
    // Every row carries the same session; with no rows there is none to name.
    asOf: rows[0]?.as_of ?? null,
    // The query has already ranked each direction, so these only split the two
    // halves of the union back apart — re-sorting here would be redundant.
    gainers: rows.filter((row) => row.change > 0).map(toMover),
    losers: rows.filter((row) => row.change < 0).map(toMover),
  };
}
