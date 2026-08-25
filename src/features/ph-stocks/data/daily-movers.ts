import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type { DailyMover, DailyMovers } from './dto';
import { PSE_INDEX_SYMBOLS } from './pse-indices';

/**
 * How many movers each list holds.
 *
 * A movers page is the ends of the board, not the whole of it. The PSE lists a
 * few hundred stocks and most of them move a little every session, so an
 * uncapped page shipped a row for each of them to show the handful anyone came
 * to read. Fifty, the same depth `LEADERS_LIMIT` cuts each ranking to.
 */
export const MOVER_LIMIT = 50;

/**
 * The session's biggest movers in each direction.
 *
 * The session is the newest timestamp in the table rather than today's date, so
 * the page describes the data it actually has — over a weekend, or while the
 * upstream loader is behind, that is Friday's session and not an empty one. It
 * is the newest timestamp *among the stocks*: the indices are written by the
 * same loader we do not own, and were one of them ever to land ahead of the
 * stock bars, a session taken over the whole table would match no stock at all
 * and empty the page.
 *
 * `previous` deliberately takes each symbol's own last bar before that session
 * rather than the session before it: a stock that did not trade yesterday is
 * still up or down against whenever it last did, which is the change the PSE
 * itself quotes. The `LEFT JOIN` of the year-to-date query would be wrong here —
 * a symbol with no earlier bar has no change to rank, so an inner join drops it.
 *
 * The ranking happens here rather than in TypeScript so that the two `LIMIT`s
 * decide what crosses the wire: a hundred rows arrive instead of the whole
 * board. Ordering by `change_percent` descending for gainers and ascending for
 * losers puts the biggest move first in each, with the symbol breaking ties so
 * the order is stable between requests.
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
    WHERE symbol <> ALL($1::text[])
  ),
  latest AS (
    SELECT m.symbol, m.close
    FROM market_data m, session s
    WHERE m.timestamp = s.ts AND m.symbol <> ALL($1::text[])
  ),
  previous AS (
    SELECT DISTINCT ON (m.symbol) m.symbol, m.close
    FROM market_data m, session s
    WHERE m.timestamp < s.ts AND m.symbol <> ALL($1::text[])
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
    LIMIT $2
  )
  UNION ALL
  (
    SELECT * FROM moves
    WHERE change < 0
    ORDER BY change_percent ASC, symbol
    LIMIT $2
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

  const { rows } = await phStocksDb().query<MoverRow>(DAILY_MOVERS_SQL, [
    PSE_INDEX_SYMBOLS,
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
